package com.yymusic.service.impl;

import java.util.List;
import java.util.Set;

import com.yymusic.api.MusicCreateApi;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.MusicCreationResultDto;
import com.yymusic.entity.dto.MusicTaskDto;
import com.yymusic.entity.enums.*;
import com.yymusic.entity.po.*;
import com.yymusic.entity.query.*;
import com.yymusic.entity.vo.MusicInfoVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.mappers.UserInfoMapper;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.UserIntegralRecordService;
import com.yymusic.spring.SpringContext;
import com.yymusic.utils.CopyTools;
import com.yymusic.utils.FileUtils;
import com.yymusic.utils.JsonUtils;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.mappers.MusicInfoMapper;
import com.yymusic.service.MusicInfoService;
import com.yymusic.utils.StringTools;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.ExecutorService;


/**
 * 音乐信息 业务接口实现
 */
@Service
@Slf4j
public class MusicInfoServiceImpl implements MusicInfoService {

    @Resource
    private MusicInfoMapper<MusicInfo, MusicInfoQuery> musicInfoMapper;

    @Resource
    private UserInfoMapper<UserInfo, UserInfoQuery> userInfoMapper;

    @Resource
    private UserIntegralRecordService userIntegralRecordService;

    @Resource
    private FileUtils fileUtils;

    @Resource
    private RedisComponent redisComponent;

    @Resource
    private AppConfig appConfig;

    @Resource
    @Lazy
    private MusicInfoService musicInfoService;

    @Resource
    private SpringContext springContext;

    @Resource
    @Qualifier("backgroundTaskExecutor")
    private ExecutorService backgroundTaskExecutor;

    /**
     * 根据条件查询列表
     */
    @Override
    public List<MusicInfo> findListByParam(MusicInfoQuery param) {
        return this.musicInfoMapper.selectList(param);
    }

    /**
     * 根据条件查询列表
     */
    @Override
    public Integer findCountByParam(MusicInfoQuery param) {
        return this.musicInfoMapper.selectCount(param);
    }

    /**
     * 分页查询方法
     */
    @Override
    public PaginationResultVO<MusicInfo> findListByPage(MusicInfoQuery param) {
        int count = this.findCountByParam(param);
        int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

        SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
        param.setSimplePage(page);
        List<MusicInfo> list = this.findListByParam(param);
        PaginationResultVO<MusicInfo> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
        return result;
    }

    /**
     * 新增
     */
    @Override
    public Integer add(MusicInfo bean) {
        return this.musicInfoMapper.insert(bean);
    }

    /**
     * 批量新增
     */
    @Override
    public Integer addBatch(List<MusicInfo> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.musicInfoMapper.insertBatch(listBean);
    }

    /**
     * 批量新增或者修改
     */
    @Override
    public Integer addOrUpdateBatch(List<MusicInfo> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.musicInfoMapper.insertOrUpdateBatch(listBean);
    }

    /**
     * 多条件更新
     */
    @Override
    public Integer updateByParam(MusicInfo bean, MusicInfoQuery param) {
        StringTools.checkParam(param);
        return this.musicInfoMapper.updateByParam(bean, param);
    }

    /**
     * 多条件删除
     */
    @Override
    public Integer deleteByParam(MusicInfoQuery param) {
        StringTools.checkParam(param);
        return this.musicInfoMapper.deleteByParam(param);
    }

    /**
     * 根据MusicId获取对象
     */
    @Override
    public MusicInfo getMusicInfoByMusicId(String musicId) {
        return this.musicInfoMapper.selectByMusicId(musicId);
    }

    /**
     * 根据MusicId修改
     */
    @Override
    public Integer updateMusicInfoByMusicId(MusicInfo bean, String musicId) {
        return this.musicInfoMapper.updateByMusicId(bean, musicId);
    }

    /**
     * 根据MusicId删除
     */
    @Override
    public Integer deleteMusicInfoByMusicId(String musicId) {
        return this.musicInfoMapper.deleteByMusicId(musicId);
    }

    /**
     * 根据TaskId获取对象
     */
    @Override
    public MusicInfo getMusicInfoByTaskId(String taskId) {
        return this.musicInfoMapper.selectByTaskId(taskId);
    }

    /**
     * 根据TaskId修改
     */
    @Override
    public Integer updateMusicInfoByTaskId(MusicInfo bean, String taskId) {
        return this.musicInfoMapper.updateByTaskId(bean, taskId);
    }

    /**
     * 根据TaskId删除
     */
    @Override
    public Integer deleteMusicInfoByTaskId(String taskId) {
        return this.musicInfoMapper.deleteByTaskId(taskId);
    }

    @Override
    public List<MusicInfoVO> findListByParamWithJoin(MusicInfoQuery param) {
        return this.musicInfoMapper.selectListWithJoinUserInfo(param);
    }

    @Override
    public PaginationResultVO<MusicInfoVO> findListByPageWithJoin(MusicInfoQuery param) {
        int count = this.findCountByParam(param);
        int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

        SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
        param.setSimplePage(page);
        List<MusicInfoVO> list = this.findListByParamWithJoin(param);
        PaginationResultVO<MusicInfoVO> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
        return result;
    }

    @Override
    public MusicInfoVO getMusicInfoVOByMusicId(String musicId) {
        return musicInfoMapper.selectMusicInfoVOByMusicId(musicId);
    }

    @Override
    public void updateMusicPlayCountByMusicId(String musicId) {
        this.musicInfoMapper.updateMusicPlayCountByMusicId(musicId);
    }

    @Override
    public void musicCreateNotify(Integer musicType, String body, String model) {
        String apiCode = null;
        if (MusicTypeEnum.MUSIC.getType().equals(musicType)) {
            ModelType4MusicEnum modelType4MusicEnum = ModelType4MusicEnum.getByModelCode(model);
            apiCode = modelType4MusicEnum == null ? ModelType4MusicEnum.COMFY_UI.getApiCode() : modelType4MusicEnum.getApiCode();
        } else if (MusicTypeEnum.PURE.getType().equals(musicType)) {
            ModelType4PureMusicEnum modelType4PureMusicEnum = ModelType4PureMusicEnum.getByModelCode(model);
            apiCode = modelType4PureMusicEnum == null ? ModelType4MusicEnum.COMFY_UI.getApiCode() : modelType4PureMusicEnum.getApiCode();
        }
        MusicCreateApi musicCreateApi = (MusicCreateApi) springContext.getBean(apiCode);
        MusicCreationResultDto musicCreationResultDto = musicCreateApi.createMusicNotify(musicType, body);
        if (musicCreationResultDto == null) {
            return;
        }
        // 更新音乐信息(歌词/标题/时长/状态/音频路径),下载音乐到本地
        musicInfoService.musicCreated(musicCreationResultDto);
    }

    /*
     * 更新音乐信息(歌词/标题/时长/状态/音频路径),下载音乐到本地
     * */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void musicCreated(MusicCreationResultDto musicCreationResultDto) {
        MusicInfo updateInfo = new MusicInfo();
        if (musicCreationResultDto.getIsSuccess()) {
            updateInfo.setMusicTitle(musicCreationResultDto.getTitle());
            updateInfo.setDuration(musicCreationResultDto.getDuration());
            String lyrics = JsonUtils.convertObj2Json(musicCreationResultDto.getLyricsList());
            updateInfo.setLyrics(lyrics);
            updateInfo.setMusicStatus(MusicStatusEnum.CREATED.getCode());
            String audioPath = fileUtils.downloadFile(musicCreationResultDto.getAudioUrl(), Constants.MUSIC_SUFFIX);
            updateInfo.setAudioPath(audioPath);
        } else {
            updateInfo.setMusicStatus(MusicStatusEnum.CREATE_FAIL.getCode());

            // 退还用户积分
            MusicInfo musicInfo = this.getMusicInfoByTaskId(musicCreationResultDto.getTaskId());
            if (musicInfo == null) {
                throw new BusinessException("音乐不存在");
            }
            UserIntegralRecordQuery userIntegralRecordQuery = new UserIntegralRecordQuery();
            userIntegralRecordQuery.setUserId(musicInfo.getUserId());
            userIntegralRecordQuery.setBusinessId(musicInfo.getCreationId());
            List<UserIntegralRecord> list = this.userIntegralRecordService.findListByParam(userIntegralRecordQuery);
            UserIntegralRecord userIntegralRecord = list.get(0);
            userIntegralRecordService.changeUserIntegral(UserIntegralRecordTypeEnum.CREATE_MUSIC_BACK, musicInfo.getCreationId(), musicInfo.getUserId(), -userIntegralRecord.getChangeIntegral(), null);
        }


        MusicInfoQuery query = new MusicInfoQuery();
        query.setTaskId(musicCreationResultDto.getTaskId());
        query.setMusicStatus(MusicStatusEnum.CREATING.getCode());

        Integer changeCount = this.updateByParam(updateInfo, query);
        if (changeCount == 0) {
            throw new BusinessException("更新音乐状态失败");
        }
    }


    @PostConstruct
    public void getMusicFromQueue() {
        if (!appConfig.getAutoCheckMusic()) {
            return;
        }
        backgroundTaskExecutor.execute(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Set<MusicTaskDto> queueDataList = redisComponent.getMusicTaskDto();
                    if (queueDataList == null || queueDataList.isEmpty()) {
                        Thread.sleep(5000);
                        continue;
                    }
                    for (MusicTaskDto musicTaskDto : queueDataList) {
                        redisComponent.removeMusicTaskDto(musicTaskDto);
                        getMusicInfoFromAi(musicTaskDto);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.info("Music polling task interrupted, exiting");
                    break;
                } catch (Exception e) {
                    log.error("获取队列信息失败", e);
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        log.info("Music polling task interrupted during sleep, exiting");
                        break;
                    }
                }
            }
        });
    }

    private void getMusicInfoFromAi(MusicTaskDto musicTaskDto) {
        MusicCreateApi musicCreateApi = (MusicCreateApi) springContext.getBean(musicTaskDto.getApiCode());
        MusicCreationResultDto musicCreationResultDto = null;
        if (MusicTypeEnum.MUSIC.getType().equals(musicTaskDto.getMusicType())) {
            musicCreationResultDto = musicCreateApi.musicQuery(musicTaskDto.getTaskId());
        } else {
            musicCreationResultDto = musicCreateApi.pureMusicQuery(musicTaskDto.getTaskId());
        }
        if (musicCreationResultDto == null) {
            redisComponent.addMusicCreateTask(musicTaskDto);
            return;
        }
        musicInfoService.musicCreated(musicCreationResultDto);
    }

    @Override
    public String uploadCover(String userId, String musicId, MultipartFile file) throws BusinessException {
        MusicInfo musicInfo = musicInfoService.getMusicInfoByMusicId(musicId);
        if (musicInfo == null || !musicInfo.getUserId().equals(userId)) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        String suffix = StringTools.getFileSuffix(file.getOriginalFilename());
        String fileName = musicId + suffix;
        String coverPath = fileUtils.uploadFile(file, null, fileName) + "&" + System.currentTimeMillis();

        MusicInfo updateInfo = new MusicInfo();
        updateInfo.setCover(coverPath);

        musicInfoMapper.updateByMusicId(updateInfo, musicId);
        return coverPath;
    }

    @Override
    public void delMusic(String userId, String musicId) {
        MusicInfo musicInfo = musicInfoMapper.selectByMusicId(musicId);
        if (musicInfo == null) {
            return;
        }

        fileUtils.deleteFile(musicInfo.getAudioPath());
        fileUtils.deleteFile(removeTimeStamp(musicInfo.getCover()));

        MusicInfoQuery param = new MusicInfoQuery();
        param.setUserId(userId);
        param.setMusicId(musicId);
        this.deleteByParam(param);
    }

    private String removeTimeStamp(String cover) {
        if (cover == null) {
            return null;
        }
        return cover.split("&")[0];
    }


}
