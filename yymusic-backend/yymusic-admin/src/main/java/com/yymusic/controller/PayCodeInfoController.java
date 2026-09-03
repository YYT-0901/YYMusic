package com.yymusic.controller;

import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.enums.PayCodeStatusEnum;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.entity.po.PayCodeInfo;
import com.yymusic.entity.po.ProductInfo;
import com.yymusic.entity.query.PayCodeInfoQuery;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.service.PayCodeInfoService;
import com.yymusic.service.ProductInfoService;
import com.yymusic.utils.StringTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 商品信息 Controller
 */
@RestController
@RequestMapping("/payCode")
@Slf4j
@Validated
@Tag(name = "支付码相关接口")
public class PayCodeInfoController extends ABaseController {

    @Resource
    private PayCodeInfoService payCodeInfoService;

    @Resource
    private ProductInfoService productInfoService;

    @Operation(summary = "获取支付码列表", description = "返回分页的支付码列表")
    @RequestMapping("/loadPayCodeList")
    public ResponseVO loadPayCodeList(PayCodeInfoQuery payCodeInfoQuery) {
        return getSuccessResponseVO(payCodeInfoService.findListByPageWithUser(payCodeInfoQuery));
    }

    @Operation(summary = "创建支付码", description = "根据金额创建支付码")
    @RequestMapping("/createCode")
    public ResponseVO createCode(@NotNull BigDecimal amount) {
        PayCodeInfo payCodeInfo = new PayCodeInfo();
        payCodeInfo.setAmount(amount);
        String payCode = StringTools.getRandomNumber(Constants.LENGTH_8);
        payCodeInfo.setPayCode(payCode);
        payCodeInfo.setStatus(PayCodeStatusEnum.NO_USE.getCode());
        payCodeInfo.setCreateTime(new Date());
        payCodeInfoService.add(payCodeInfo);
        return getSuccessResponseVO(payCode);
    }

    @Operation(summary = "根据商品ID创建支付码", description = "根据商品ID创建支付码")
    @RequestMapping("/createCodeWithProductId")
    public ResponseVO createCodeWithProductId(@NotEmpty String productId) {
        ProductInfo productInfo = productInfoService.getProductInfoByProductId(productId);
        if (productInfo == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        PayCodeInfo payCodeInfo = new PayCodeInfo();
        payCodeInfo.setAmount(productInfo.getPrice());
        String payCode = StringTools.getRandomNumber(Constants.LENGTH_8);
        payCodeInfo.setPayCode(payCode);
        payCodeInfo.setStatus(PayCodeStatusEnum.NO_USE.getCode());
        payCodeInfo.setCreateTime(new Date());
        payCodeInfoService.add(payCodeInfo);
        return getSuccessResponseVO(payCode);
    }

    @Operation(summary = "删除支付码", description = "根据支付码删除支付码")
    @RequestMapping("/delCode")
    public ResponseVO delCode(@NotEmpty String payCode) {
        payCodeInfoService.deletePayCodeInfoByPayCode(payCode);
        return getSuccessResponseVO(null);
    }
}