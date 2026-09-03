package com.yymusic.controller;

import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.vo.MusicInfoVO;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.MusicInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/music")
@Slf4j
@Tag(name = "音乐管理接口")
public class MusicInfoController extends ABaseController {

    @Resource
    private MusicInfoService musicInfoService;

    @Operation(summary = "加载音乐列表")
    @RequestMapping("/loadMusic")
    public ResponseVO loadMusic(MusicInfoQuery musicInfoQuery) {
        musicInfoQuery.setOrderBy("m.create_time desc");
        PaginationResultVO<MusicInfoVO> resultVO = musicInfoService.findListByPageWithJoin(musicInfoQuery);
        return getSuccessResponseVO(resultVO);
    }

    @Operation(summary = "修改音乐推荐类型")
    @RequestMapping("/changeMusicCommendType")
    public ResponseVO changeMusicCommendType(String musicId, Integer commendType) {
        MusicInfo musicInfo = new MusicInfo();
        musicInfo.setCommendType(commendType);
        musicInfoService.updateMusicInfoByMusicId(musicInfo, musicId);
        return getSuccessResponseVO(null);
    }
}
