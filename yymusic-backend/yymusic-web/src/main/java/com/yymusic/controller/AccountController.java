package com.yymusic.controller;

import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.entiity.dto.LoginDto;
import com.yymusic.entiity.dto.RegisterDto;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.po.UserInfo;
import com.yymusic.entity.vo.CheckCodeVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.UserInfoService;
import com.wf.captcha.ArithmeticCaptcha;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 用户信息 Controller
 */
@RestController
@RequestMapping("/account")
@Slf4j
@Validated
@Tag(name = "用户账号管理", description = "获取验证码/登录/登出/注册/获取登录用户信息")
public class AccountController extends ABaseController{

	@Resource
	private UserInfoService userInfoService;
	
	@Resource
	private RedisComponent redisComponent;

	@Operation(summary = "获取验证码", description = "返回验证码图片和验证码Key")
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

	@Operation(summary = "用户注册", description = "根据邮箱、密码、昵称、验证码Key、验证码来注册新用户")
	@RequestMapping("/register")
	public ResponseVO register(@RequestBody RegisterDto registerDto) {
		try {
			if(!registerDto.getCheckCode().equals(redisComponent.getCheckCode(registerDto.getCheckCodeKey()))) {
				throw new BusinessException("图片验证码不正确");
			}
			userInfoService.register(registerDto.getEmail(), registerDto.getPassword(), registerDto.getNickName());
			return getSuccessResponseVO(null);
		} finally {
			redisComponent.cleanCheckCode(registerDto.getCheckCodeKey());
		}
	}

	@Operation(summary = "用户登录", description = "根据邮箱、密码、验证码Key、验证码来登录用户")
	@PostMapping("/login")
	public ResponseVO login(@RequestBody  LoginDto loginDto) {
		try {
			if(!loginDto.getCheckCode().equals(redisComponent.getCheckCode(loginDto.getCheckCodeKey()))) {
				throw new BusinessException("图片验证码不正确");
			}
			TokenUserInfoDto tokenUserInfoDto = userInfoService.login(loginDto.getEmail(), loginDto.getPassword());
			return getSuccessResponseVO(tokenUserInfoDto);
		} finally {
			redisComponent.cleanCheckCode(loginDto.getCheckCodeKey());
		}
	}

	@Operation(summary = "获取登录用户信息", description = "根据用户请求头携带的Token获取用户信息并返回")
	@RequestMapping("/getLoginInfo")
	public ResponseVO getLoginInfo() {
		TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
		if(tokenUserInfoDto == null) {
			return getSuccessResponseVO(null);
		}
		UserInfo userInfo = userInfoService.getUserInfoByUserId(tokenUserInfoDto.getUserId());
		tokenUserInfoDto.setIntegral(userInfo.getIntegral());
		redisComponent.saveTokenUserInfoDto(tokenUserInfoDto);
		return getSuccessResponseVO(tokenUserInfoDto);
	}

	@Operation(summary = "用户登出", description = "根据用户请求头携带的Token登出用户")
	@RequestMapping("/logout")
    public ResponseVO logout() {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        if (tokenUserInfoDto == null) {
            return getSuccessResponseVO(null);
        }
        redisComponent.cleanTokenUserInfoDto(tokenUserInfoDto.getToken());
        return getSuccessResponseVO(null);
    }

	@Operation(summary = "修改密码", description = "根据用户请求头携带的Token修改密码")
	@PostMapping("/updatePassword")
	@GlobalInterceptor(checkLogin = true)
    public ResponseVO updatePassword( @NotEmpty String oldPassword, @RequestParam @NotEmpty String newPassword) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
		userInfoService.updatePassword(oldPassword, newPassword, tokenUserInfoDto.getUserId());
        return getSuccessResponseVO(null);
    }

	@Operation(summary = "修改密码", description = "根据用户请求头携带的Token修改密码")
	@PostMapping("/updateUserInfo")
	@GlobalInterceptor(checkLogin = true)
    public ResponseVO updateUserInfo(MultipartFile avatar,@NotEmpty @Size(max = 20) String nickName) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
		userInfoService.updateUserInfo(tokenUserInfoDto, avatar, nickName);
        return getSuccessResponseVO(tokenUserInfoDto);
    }
}