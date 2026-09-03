package com.yymusic.controller;

import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoAdminDto;
import com.yymusic.entity.vo.CheckCodeVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.UserInfoService;
import com.yymusic.utils.StringTools;
import com.wf.captcha.ArithmeticCaptcha;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户信息 Controller
 */
@RestController
@RequestMapping("/account")
@Slf4j
@Validated
@Tag(name = "账号相关接口")
public class AccountController extends ABaseController {

    @Resource
    private UserInfoService userInfoService;

    @Resource
    private RedisComponent redisComponent;

    @Resource
    private AppConfig appConfig;

    @Operation(summary = "获取验证码", description = "返回验证码图片和key")
    @RequestMapping("/checkCode")
    public ResponseVO checkCode() {
        ArithmeticCaptcha captcha = new ArithmeticCaptcha(100, 42);
        String code = captcha.text();
        String checkCodeKey = redisComponent.saveCheckCode(code);
        String checkCodeBase64 = captcha.toBase64();
        CheckCodeVO checkCodeVO = new CheckCodeVO();
        checkCodeVO.setCheckCodeKey(checkCodeKey);
        checkCodeVO.setCheckCode(checkCodeBase64);
        return getSuccessResponseVO(checkCodeVO);
    }

    @Operation(summary = "登录", description = "返回token")
    @RequestMapping("/login")
    public ResponseVO login(@NotEmpty String checkCodeKey,
                            @NotEmpty String checkCode,
                            @NotEmpty String account,
                            @NotEmpty String password) {
        try {
            if (!redisComponent.getCheckCode(checkCodeKey).equals(checkCode)) {
                throw new BusinessException("图片验证码不正确");
            }

            if (!account.equals(appConfig.getAdminAccount()) || !password.equals(StringTools.encodeByMD5(appConfig.getAdminPassword()))) {
                throw new BusinessException("账号或密码错误");
            }
            TokenUserInfoAdminDto tokenUserInfoAdminDto = new TokenUserInfoAdminDto();
            tokenUserInfoAdminDto.setAccount(account);
            tokenUserInfoAdminDto.setToken(StringTools.getRandomNumber(Constants.LENGTH_30));
            redisComponent.saveTokenUserInfoAdminDto(tokenUserInfoAdminDto);
            return getSuccessResponseVO(tokenUserInfoAdminDto);
        } finally {
            redisComponent.cleanCheckCode(checkCodeKey);
        }
    }

    @Operation(summary = "退出登录", description = "返回null")
    @RequestMapping("/logout")
    public ResponseVO logout() {
        TokenUserInfoAdminDto tokenUserInfoAdminDto = getTokenUserInfoAdminDto(null);
        if (tokenUserInfoAdminDto == null) {
            return getSuccessResponseVO(null);
        }
        redisComponent.cleanTokenUserInfoAdminDto(tokenUserInfoAdminDto.getToken());
        return getSuccessResponseVO(null);
    }
}