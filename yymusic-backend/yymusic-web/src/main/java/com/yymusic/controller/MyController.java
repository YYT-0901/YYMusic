package com.yymusic.controller;

import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.entiity.dto.CreateMusicDto;
import com.yymusic.entity.dto.MusicSettingDto;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.po.MusicCreation;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.po.SysDict;
import com.yymusic.entity.po.UserIntegralRecord;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.query.UserIntegralRecordQuery;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * 用户信息 Controller
 */
@RestController
@RequestMapping("/my")
@Slf4j
@Validated
@Tag(name = "关于音乐操作相关接口", description = "用户信息相关接口")
public class MyController extends ABaseController {

    @Resource
    private SysDictService sysDictService;

    @Resource
    private UserIntegralRecordService userIntegralRecordService;

    @Resource
    private MusicCreationService musicCreationService;

    @Resource
    private MusicInfoService musicInfoService;

    @Operation(summary = "查询用户积分记录", description = "返回用户积分记录分页列表")
    @PostMapping("integralRecords")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO integralRecords(@RequestParam Integer pageNo) {
        UserIntegralRecordQuery query = new UserIntegralRecordQuery();
        query.setUserId(getTokenUserInfoDto(null).getUserId());
        query.setPageNo(pageNo);
        query.setOrderBy("record_id desc");
        PaginationResultVO<UserIntegralRecord> listByPage = userIntegralRecordService.findListByPage(query);
        return getSuccessResponseVO(listByPage);
    }

    @Operation(summary = "获取系统字典", description = "从缓存中获取")
    @GetMapping("loadSysDict")
    public ResponseVO loadSysDict() {
        Map<String, List<SysDict>> map = sysDictService.getDictFromCache();
        return getSuccessResponseVO(map);
    }

    @Operation(summary = "创建音乐", description = "前端传提示词/歌词/音乐类型(歌/纯音乐)/音乐高级性质, 返回一个列表(音乐ID)用于查询生成出来的音乐")
    @PostMapping("createMusic")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO createMusic(@RequestBody CreateMusicDto createMusicDto) {
        // 获取请求用户的信息
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        // 填写创建音乐
        MusicCreation musicCreation = new MusicCreation();
        musicCreation.setUserId(tokenUserInfoDto.getUserId());
        musicCreation.setMusicType(createMusicDto.getMusicType());
        musicCreation.setLyrics(createMusicDto.getLyrics());
        musicCreation.setPrompt(createMusicDto.getPrompt());
        musicCreation.setModel(createMusicDto.getModel());
        musicCreation.setModeType(createMusicDto.getModeType());

        // 填写音乐设置
        MusicSettingDto musicSettingDto = new MusicSettingDto();
        musicSettingDto.setMusicGener(createMusicDto.getMusicGener());
        musicSettingDto.setMusicEmotion(createMusicDto.getMusicEmotion());
        musicSettingDto.setMusicSex(createMusicDto.getMusicSex());
        musicSettingDto.setMusicChord(createMusicDto.getMusicChord());
        musicSettingDto.setMusicTone(createMusicDto.getMusicTone());

        List<String> musicList = musicCreationService.createMusic(musicCreation, musicSettingDto);

        return getSuccessResponseVO(musicList);
    }

    @Operation(summary = "查询用户创建的音乐列表", description = "返回用户创建的音乐分页列表")
    @PostMapping("loadMyMusic")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO loadMyMusic(@RequestParam("pageNo") Integer pageNo, @RequestParam("queryLikeMusic") Boolean queryLikeMusic) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        if (tokenUserInfoDto == null) {
            return getSuccessResponseVO(new PaginationResultVO<>());
        }
        MusicInfoQuery query = new MusicInfoQuery();
        query.setPageNo(pageNo);
        query.setOrderBy("create_time desc");
        query.setQueryLikeMusic(queryLikeMusic != null && queryLikeMusic);
        query.setUserId(tokenUserInfoDto.getUserId());
        PaginationResultVO<MusicInfo> listByPage = this.musicInfoService.findListByPage(query);
        return getSuccessResponseVO(listByPage);
    }

    @Operation(summary = "前端轮询查询创建中的音乐是否创建完毕", description = "返回创建中的音乐列表,前端会根据返回状态更新页面,如果状态为CREATED,则表示音乐创建完毕,否则表示音乐创建中,继续轮询查询")
    @PostMapping("loadCreatingMusic")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO loadCreatingMusic(@RequestParam("musicIds") @NotEmpty String musicIds) {
        MusicInfoQuery query = new MusicInfoQuery();
        query.setUserId(getTokenUserInfoDto(null).getUserId());
        query.setMusicIdList(Arrays.asList(musicIds.split(",")));
        List<MusicInfo> listByParam = this.musicInfoService.findListByParam(query);
        return getSuccessResponseVO(listByParam);
    }

    @Operation(summary = "上传音乐封面", description = "上传音乐封面,返回封面路径")
    @PostMapping("uploadMusicCover")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO uploadMusicCover(@NotEmpty String musicId, @NotNull MultipartFile cover) {
        TokenUserInfoDto tokenUserInfoDto = getTokenUserInfoDto(null);
        String coverPath = musicInfoService.uploadCover(tokenUserInfoDto.getUserId(), musicId, cover);
        return getSuccessResponseVO(coverPath);
    }

    @Operation(summary = "删除音乐", description = "删除用户创建的音乐")
    @DeleteMapping("delMusic")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO delMusic(@RequestParam("musicId") @NotEmpty String musicId) {
        musicInfoService.delMusic(getTokenUserInfoDto(null).getUserId(), musicId);
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "修改音乐标题", description = "修改用户创建的音乐标题")
    @PutMapping("changeMusicTitle")
    @GlobalInterceptor(checkLogin = true)
    public ResponseVO changeMusicTitle(@RequestParam("musicId") @NotEmpty String musicId, @RequestParam("musicTitle") @Size(max = 30) @NotEmpty String musicTitle) {
        MusicInfo musicInfo = new MusicInfo();
        musicInfo.setMusicTitle(musicTitle);

        MusicInfoQuery param = new MusicInfoQuery();
        param.setUserId(getTokenUserInfoDto(null).getUserId());
        param.setMusicId(musicId);

        musicInfoService.updateByParam(musicInfo, param);
        return getSuccessResponseVO(null);
    }

}