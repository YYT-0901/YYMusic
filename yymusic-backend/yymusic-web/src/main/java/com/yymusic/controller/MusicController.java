package com.yymusic.controller;

import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.entiity.dto.LoadLatestMusicDto;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.CommendTypeEnum;
import com.yymusic.entity.enums.MusicStatusEnum;
import com.yymusic.entity.enums.PageSize;
import com.yymusic.entity.enums.SortTypeEnum;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.entity.vo.MusicInfoVO;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.MusicCreationService;
import com.yymusic.service.MusicInfoActionService;
import com.yymusic.service.MusicInfoService;
import com.yymusic.utils.StringTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;

/**
 * 用户信息 Controller
 */
@RestController
@RequestMapping("/music")
@Slf4j
@Validated
@Tag(name = "音乐相关接口")
public class MusicController extends ABaseController {

    @Resource
    private MusicInfoService musicInfoService;

    @Resource
    private MusicInfoActionService musicInfoActionService;

    @Resource
    private MusicCreationService musicCreationService;

    /*
     * 加载推荐音乐
     *
     * @return 推荐音乐列表
     * */
    @Operation(summary = "获取推荐音乐列表", description = "返回无分页的音乐推荐列表")
    @PostMapping("/loadCommendMusic")
    public ResponseVO loadCommendMusic(@RequestParam(value = "isRandomTwo", required = false) Boolean isRandomTwo) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        MusicInfoQuery musicInfoQuery = new MusicInfoQuery();
        musicInfoQuery.setCommendType(CommendTypeEnum.COMMENT.getCode());
        musicInfoQuery.setMusicStatus(MusicStatusEnum.CREATED.getCode());
        musicInfoQuery.setOrderBy("m.create_time desc");
        if(isRandomTwo != null && isRandomTwo) {
            musicInfoQuery.setOrderBy("RAND()");
            musicInfoQuery.setSimplePage(new SimplePage(0, 2));
        }
        musicInfoQuery.setCurrentUserId(tokenUserInfoDto == null ? null : tokenUserInfoDto.getUserId());
        List<MusicInfoVO> musicInfoVOList = musicInfoService.findListByParamWithJoin(musicInfoQuery);
        return getSuccessResponseVO(musicInfoVOList);
    }

    @Operation(summary = "获取音乐列表", description = "返回分页的音乐列表")
    @PostMapping("/loadLatestMusic")
    public ResponseVO loadLatestMusic(@RequestBody LoadLatestMusicDto loadLatestMusicDto) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        MusicInfoQuery musicInfoQuery = new MusicInfoQuery();
        musicInfoQuery.setCommendType(CommendTypeEnum.NOT_COMMENT.getCode());
        musicInfoQuery.setMusicStatus(MusicStatusEnum.CREATED.getCode());
        musicInfoQuery.setPageSize(PageSize.SIZE12.getSize());
        if(Objects.equals(loadLatestMusicDto.getSortType(), SortTypeEnum.NEW.getCode())) {
            musicInfoQuery.setOrderBy("m.create_time desc");
        } else {
            musicInfoQuery.setOrderBy("m.good_count desc");
        }


        musicInfoQuery.setPageNo(loadLatestMusicDto.getPageNo());
        musicInfoQuery.setCurrentUserId(tokenUserInfoDto == null ? null : tokenUserInfoDto.getUserId());
        PaginationResultVO<MusicInfoVO> musicInfoVOList = musicInfoService.findListByPageWithJoin(musicInfoQuery);
        return getSuccessResponseVO(musicInfoVOList);
    }

    @Operation(summary = "获取音乐详情", description = "返回音乐详情")
    @RequestMapping("musicDetail")
    public ResponseVO musicDetail(@RequestParam(value = "musicId", required = true) String musicId) {
        MusicInfoVO musicInfoVO = musicInfoService.getMusicInfoVOByMusicId(musicId);
        return getSuccessResponseVO(musicInfoVO);
    }

    @Operation(summary = "更新播放次数", description = "更新音乐播放次数")
    @PostMapping("updatePlayCount")
    public ResponseVO updatePlayCount(@RequestParam(value = "musicId", required = true) String musicId) {
        musicInfoService.updateMusicPlayCountByMusicId(musicId);
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "点赞音乐", description = "用户点赞音乐")
    @PostMapping("doGood")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO doGood(@RequestParam(value = "musicId", required = true) String musicId) {
        musicInfoActionService.doGood(musicId, getTokenUserInfoDto(null).getUserId());
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "获取音乐创建详情", description = "返回音乐创建详情(提示词,音乐类型,曲风等等)")
    @RequestMapping("getCreation")
    public ResponseVO getCreation(@NotEmpty String creationId) {
        return getSuccessResponseVO(musicCreationService.getMusicCreationByCreationId(creationId));
    }

    @Operation(summary = "下载音乐音频", description = "根据 musicId 下载音乐音频文件")
    @GetMapping("/downloadMusic")
    public void downloadMusic(@RequestParam @NotEmpty String musicId, HttpServletResponse response) {
        MusicInfo musicInfo = musicInfoService.getMusicInfoByMusicId(musicId);
        if (musicInfo == null || !MusicStatusEnum.CREATED.getCode().equals(musicInfo.getMusicStatus())
                || StringTools.isEmpty(musicInfo.getAudioPath())) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        String downloadFileName = buildDownloadFileName(musicInfo);
        streamMusicFile(response, musicInfo.getAudioPath(), downloadFileName);
    }

    private void streamMusicFile(HttpServletResponse response, String audioPath, String downloadFileName) {
        try {
            URLConnection connection = new URL(audioPath).openConnection();
            connection.connect();

            response.reset();
            response.setContentType(StringTools.isEmpty(connection.getContentType()) ? "audio/mpeg" : connection.getContentType());
            response.setHeader("Content-Disposition", buildContentDisposition(downloadFileName));
            long contentLength = connection.getContentLengthLong();
            if (contentLength > 0) {
                response.setHeader("Content-Length", String.valueOf(contentLength));
            }

            try (InputStream inputStream = connection.getInputStream();
                 OutputStream outputStream = response.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int len;
                while ((len = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, len);
                }
                outputStream.flush();
            }
        } catch (Exception e) {
            log.error("下载音乐文件失败, audioPath: {}", audioPath, e);
            if (!response.isCommitted()) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        }
    }

    private String buildDownloadFileName(MusicInfo musicInfo) {
        String baseName = StringTools.isEmpty(musicInfo.getMusicTitle()) ? musicInfo.getMusicId() : musicInfo.getMusicTitle();
        String safeBaseName = baseName.replaceAll("[\\\\/:*?\"<>|]", "_");
        String suffix = StringTools.getFileSuffix(musicInfo.getAudioPath());
        if (StringTools.isEmpty(suffix)) {
            suffix = Constants.MUSIC_SUFFIX;
        }
        return safeBaseName + suffix;
    }

    private String buildContentDisposition(String fileName) {
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        return "attachment; filename*=UTF-8''" + encodedFileName;
    }
}
