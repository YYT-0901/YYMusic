package com.yymusic.controller;

import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.entity.dto.PayInfoDto;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.*;
import com.yymusic.entity.po.ProductInfo;
import com.yymusic.entity.po.UserInfo;
import com.yymusic.entity.query.ProductInfoQuery;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.*;
import com.yymusic.utils.StringTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户信息 Controller
 */
@RestController
@RequestMapping("/buy")
@Slf4j
@Validated
@Tag(name = "购买相关接口", description = "获取列表/获取支付信息/检查支付状态")
public class BuyController extends ABaseController {

    @Resource
    private ProductInfoService productInfoService;

    @Resource
    private PayOrderInfoService payOrderInfoService;

    @Resource
    private UserInfoService userInfoService;

    @Resource
    private RedisComponent redisComponent;

    @Operation(summary = "加载在售商品", description = "根据在售状态加载在售商品")
    @RequestMapping("/loadProduct")
    public ResponseVO loadProduct() {
        ProductInfoQuery productInfoQuery = new ProductInfoQuery();
        productInfoQuery.setOrderBy("p.sort asc");
        productInfoQuery.setOnsaleType(ProductOnSaleTypeEnum.ON_SALE.getCode());
        List<ProductInfo> list = productInfoService.findListByParam(productInfoQuery);
        return getSuccessResponseVO(list);
    }

    @Operation(summary = "获取支付信息(其他渠道)", description = "返回订单号和payUrl")
    @PostMapping("/getPayInfo")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO getPayInfo(@RequestParam @NotEmpty String productId, @RequestParam @NotNull Integer payType) {
        PayInfoDto payInfoDto = payOrderInfoService.getPayInfo(getTokenUserInfoDto(null), productId, payType);
        return getSuccessResponseVO(payInfoDto);
    }

    @Operation(summary = "获取支付信息(支付宝)", description = "流式返回的一个HTML表单,前端需要将其渲染到页面")
    @GetMapping("/getPayInfoAlipay")
    public ResponseVO getPayInfoAlipay(@NotEmpty String productId, @NotNull Integer payType, @NotEmpty String token) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(token);
        if (tokenUserInfoDto == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        PayInfoDto payInfoDto =payOrderInfoService.getPayInfo(tokenUserInfoDto, productId, payType);
        return getSuccessResponseVO(payInfoDto);
    }

    /*
     * 前端会在特定页面轮询该接口,判断订单是否支付成功
     * 若支付成功,则返回用户信息,包含用户积分,前端更新页面
     * 若未支付成功,则返回空,前端继续轮询
     * */
    @Operation(summary = "检查支付状态(redis)", description = "支付成功后,会将订单号缓存到Redis,前端轮询该接口获取是否有此订单号来判断订单是否支付成功")
    @PostMapping("/checkPayOrder")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO checkHavePayOrder(@RequestParam @NotEmpty String orderId) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        String payOrder = redisComponent.getHavePayOrder(orderId);
        if (StringTools.isEmpty(payOrder)) {
            return getSuccessResponseVO(null);
        }
        UserInfo userInfo = userInfoService.getUserInfoByUserId(tokenUserInfoDto.getUserId());
        tokenUserInfoDto.setIntegral(userInfo.getIntegral());
        return getSuccessResponseVO(tokenUserInfoDto);
    }

    @Operation(summary = "检查支付状态(数据库)", description = "如果网络原因或其他原因导致缓存没有成功,调用此接口直接查找数据库的订单是否支付成功")
    @PostMapping("/havePay")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO havePay(@RequestParam @NotEmpty String orderId) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        Integer integral = payOrderInfoService.checkHavePay(orderId, tokenUserInfoDto.getUserId());
        tokenUserInfoDto.setIntegral(integral);
        return getSuccessResponseVO(tokenUserInfoDto);
    }

    @Operation(summary = "通过支付码购买商品", description = "用户输入支付码购买商品")
    @PostMapping("/buyByPayCode")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO buyByPayCode(@RequestParam @NotEmpty String checkCodeKey, @RequestParam @NotEmpty String checkCode, @RequestParam @NotEmpty String productId, @RequestParam @NotEmpty String payCode) {
        try {
            if (!checkCode.equals(redisComponent.getCheckCode(checkCodeKey))) {
                throw new BusinessException("图片验证码不正确");
            }
            payOrderInfoService.buyByPayCode(productId, payCode, getTokenUserInfoDto(null).getUserId());
            return getSuccessResponseVO(null);
        } finally {
            redisComponent.cleanCheckCode(checkCodeKey);
        }
    }

}