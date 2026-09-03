package com.yymusic.interceptor;

import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoAdminDto;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class AppInterceptor implements HandlerInterceptor {

    @Resource
    private RedisComponent redisComponent;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return false;
        }
        return checkLogin(request);
    }

    private boolean checkLogin(HttpServletRequest request) {
        TokenUserInfoAdminDto tokenUserInfoAdminDto = redisComponent.getTokenUserInfoAdminDto(request.getHeader(Constants.TOKEN));
        if (tokenUserInfoAdminDto == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
    }
}
