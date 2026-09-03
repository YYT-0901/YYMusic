package com.yymusic.controller;

import com.yymusic.entity.enums.UserIntegralRecordTypeEnum;
import com.yymusic.entity.po.UserInfo;
import com.yymusic.entity.query.UserInfoQuery;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.UserInfoService;
import com.yymusic.service.UserIntegralRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@Slf4j
@Validated
@Tag(name = "用户管理接口")
public class UserInfoController extends ABaseController {

    @Resource
    private UserInfoService userInfoService;

    @Resource
    private UserIntegralRecordService userIntegralRecordService;

    @Operation(summary = "加载用户列表")
    @RequestMapping("/loadUser")
    public ResponseVO loadUser(UserInfoQuery userInfoQuery) {
        userInfoQuery.setOrderBy("u.create_time desc");
        PaginationResultVO resultVO = userInfoService.findListByPage(userInfoQuery);
        return getSuccessResponseVO(resultVO);
    }

    @Operation(summary = "启用/禁用用户")
    @RequestMapping("/changeUserStatus")
    public ResponseVO changeUserStatus(@NotEmpty String userId, @NotNull Integer status) {
        UserInfo updateInfo = new UserInfo();
        updateInfo.setStatus(status);
        userInfoService.updateUserInfoByUserId(updateInfo, userId);
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "增加/减少用户积分")
    @RequestMapping("/changeIntegral")
    public ResponseVO changeIntegral(@NotEmpty String userId, @NotNull Integer integral) {
        userIntegralRecordService.changeUserIntegral(integral < 0 ? UserIntegralRecordTypeEnum.ADMIN_DEDUCT : UserIntegralRecordTypeEnum.ADMIN_ADD, null, userId,
                integral, null);
        return getSuccessResponseVO(null);
    }
}
