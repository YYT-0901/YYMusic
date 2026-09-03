package com.yymusic.aspect;

import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.utils.StringTools;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Component
@Aspect
public class GlobalOperationAspect {

    private final RedisComponent redisComponent;

    public GlobalOperationAspect(RedisComponent redisComponent) {
        this.redisComponent = redisComponent;
    }

    @Before("@annotation(com.yymusic.annotation.GlobalInterceptor)")
    public void interceptorDo(JoinPoint point) {
        Method method = ((MethodSignature) point.getSignature()).getMethod();
        GlobalInterceptor globalInterceptor = method.getAnnotation(GlobalInterceptor.class);
        if(globalInterceptor == null) {
            return;
        }
        if(globalInterceptor.checkLogin()) {
            checkLogin();
        }
    }

    private void checkLogin() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String token = request.getHeader(Constants.TOKEN);
        if(StringTools.isEmpty(token)) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        TokenUserInfoDto tokenUserInfoDto = redisComponent.getTokenUserInfoDto(token);
//        if(System.getProperty("dev") != null) {
//            tokenUserInfoDto = new TokenUserInfoDto();
//            tokenUserInfoDto.setUserId("282272802761");
//            tokenUserInfoDto.setNickName("新世界的神");
//            tokenUserInfoDto.setAvatar("avatar/282272802761.png");
//            tokenUserInfoDto.setToken(token);
//            tokenUserInfoDto.setIntegral(10000);
//            redisComponent.saveTokenUserInfoDto(tokenUserInfoDto);
//        }
        if(tokenUserInfoDto == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
    }
}
