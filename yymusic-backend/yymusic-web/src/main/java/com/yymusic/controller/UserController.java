package com.yymusic.controller;

import com.yymusic.entity.enums.MusicActionTypeEnum;
import com.yymusic.entity.enums.MusicStatusEnum;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.entity.po.*;
import com.yymusic.entity.query.MusicInfoActionQuery;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.entity.vo.UserInfoVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.service.*;
import com.yymusic.utils.CopyTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户信息 Controller
 */
@RestController
@RequestMapping("/user")
@Slf4j
@Validated
@Tag(name = "用户信息相关接口", description = "用户信息相关接口")
public class UserController extends ABaseController {

    @Resource
    private UserInfoService userInfoService;

    @Resource
    private MusicInfoService musicInfoService;

    @Resource
    private MusicInfoActionService musicInfoActionService;

    @Operation(summary = "获取用户信息", description = "返回用户信息")
    @PostMapping("getUserInfo")
    public ResponseVO getUserInfo(@RequestParam("userId") @NotEmpty String userId) {
        UserInfo userInfo = userInfoService.getUserInfoByUserId(userId);
        if(userInfo == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        UserInfoVO userInfoVO = CopyTools.copy(userInfo, UserInfoVO.class);
        MusicInfoQuery musicInfoQuery = new MusicInfoQuery();
        musicInfoQuery.setUserId(userId);
        musicInfoQuery.setMusicStatus(MusicStatusEnum.CREATED.getCode());
        Integer musicCount = this.musicInfoService.findCountByParam(musicInfoQuery);
        userInfoVO.setMusicCount(musicCount);

        MusicInfoActionQuery query = new MusicInfoActionQuery();
        query.setUserId(userId);
        query.setActionType(MusicActionTypeEnum.GOOD.getCode());
        Integer goodCount = musicInfoActionService.findCountByParam(query);
        userInfoVO.setGoodCount(goodCount);

        return getSuccessResponseVO(userInfoVO);
    }

    @Operation(summary = "获取用户音乐列表", description = "返回用户音乐分页列表")
    @PostMapping("loadUserMusic")
    public ResponseVO loadUserMusic(@RequestParam("userId") @NotEmpty String userId, @RequestParam("pageNo") Integer pageNo) {
        MusicInfoQuery musicInfoQuery = new MusicInfoQuery();
        musicInfoQuery.setUserId(userId);
        musicInfoQuery.setPageNo(pageNo);
        musicInfoQuery.setMusicStatus(MusicStatusEnum.CREATED.getCode());
        musicInfoQuery.setOrderBy("create_time desc");
        PaginationResultVO<MusicInfo> musicInfoPaginationResultVO = musicInfoService.findListByPage(musicInfoQuery);
        return getSuccessResponseVO(musicInfoPaginationResultVO);
    }
}