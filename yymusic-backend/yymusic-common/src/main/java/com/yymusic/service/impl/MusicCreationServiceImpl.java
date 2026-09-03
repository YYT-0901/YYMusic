package com.yymusic.service.impl;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.yymusic.api.BitAgentService;
import com.yymusic.api.MusicCreateApi;
import com.yymusic.api.impl.BitAgent4LyricsImpl;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.MusicSettingDto;
import com.yymusic.entity.dto.MusicTaskDto;
import com.yymusic.entity.enums.*;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.po.SysDict;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.exception.BusinessException;
import com.yymusic.mappers.MusicInfoMapper;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.UserIntegralRecordService;
import com.yymusic.spring.SpringContext;
import com.yymusic.utils.JsonUtils;
import jakarta.annotation.Resource;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.yymusic.entity.query.MusicCreationQuery;
import com.yymusic.entity.po.MusicCreation;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.mappers.MusicCreationMapper;
import com.yymusic.service.MusicCreationService;
import com.yymusic.utils.StringTools;
import org.springframework.transaction.annotation.Transactional;


/**
 * 音乐创作信息 业务接口实现
 */
@Service("musicCreationService")
@Slf4j
public class MusicCreationServiceImpl implements MusicCreationService {

    @Resource
    private MusicCreationMapper<MusicCreation, MusicCreationQuery> musicCreationMapper;
    @Resource
    private RedisComponent redisComponent;
    @Resource
    private UserIntegralRecordService userIntegralRecordService;
    @Resource
    private AppConfig appConfig;
    @Resource
    private MusicInfoMapper<MusicInfo, MusicInfoQuery> musicInfoMapper;
    @Resource
    private SpringContext springContext;
    @Resource
    private BitAgent4LyricsImpl bitAgentService;

    /**
     * 根据条件查询列表
     */
    @Override
    public List<MusicCreation> findListByParam(MusicCreationQuery param) {
        return this.musicCreationMapper.selectList(param);
    }

    /**
     * 根据条件查询列表
     */
    @Override
    public Integer findCountByParam(MusicCreationQuery param) {
        return this.musicCreationMapper.selectCount(param);
    }

    /**
     * 分页查询方法
     */
    @Override
    public PaginationResultVO<MusicCreation> findListByPage(MusicCreationQuery param) {
        int count = this.findCountByParam(param);
        int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

        SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
        param.setSimplePage(page);
        List<MusicCreation> list = this.findListByParam(param);
        PaginationResultVO<MusicCreation> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
        return result;
    }

    /**
     * 新增
     */
    @Override
    public Integer add(MusicCreation bean) {
        return this.musicCreationMapper.insert(bean);
    }

    /**
     * 批量新增
     */
    @Override
    public Integer addBatch(List<MusicCreation> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.musicCreationMapper.insertBatch(listBean);
    }

    /**
     * 批量新增或者修改
     */
    @Override
    public Integer addOrUpdateBatch(List<MusicCreation> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.musicCreationMapper.insertOrUpdateBatch(listBean);
    }

    /**
     * 多条件更新
     */
    @Override
    public Integer updateByParam(MusicCreation bean, MusicCreationQuery param) {
        StringTools.checkParam(param);
        return this.musicCreationMapper.updateByParam(bean, param);
    }

    /**
     * 多条件删除
     */
    @Override
    public Integer deleteByParam(MusicCreationQuery param) {
        StringTools.checkParam(param);
        return this.musicCreationMapper.deleteByParam(param);
    }

    /**
     * 根据CreationId获取对象
     */
    @Override
    public MusicCreation getMusicCreationByCreationId(String creationId) {
        return this.musicCreationMapper.selectByCreationId(creationId);
    }

    /**
     * 根据CreationId修改
     */
    @Override
    public Integer updateMusicCreationByCreationId(MusicCreation bean, String creationId) {
        return this.musicCreationMapper.updateByCreationId(bean, creationId);
    }

    /**
     * 根据CreationId删除
     */
    @Override
    public Integer deleteMusicCreationByCreationId(String creationId) {
        return this.musicCreationMapper.deleteByCreationId(creationId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<String> createMusic(MusicCreation musicCreation, MusicSettingDto musicSettingDto) {
        // 获取音乐类型(歌还是纯音乐)
        MusicTypeEnum musicTypeEnum = MusicTypeEnum.getByType(musicCreation.getMusicType());
        if (musicTypeEnum == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        // 获取模型列表
        List<SysDict> dictSubList = redisComponent.getDictSubList(musicTypeEnum.getDictCode());

        Optional<SysDict> first = dictSubList.stream().filter(value -> value.getDictCode().equals(musicCreation.getModel())).findFirst();
        if (first.isEmpty()) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        SysDict sysDict = first.get();
        String creationId = StringTools.getRandomString(Constants.LENGTH_15);
        Integer integral = Integer.parseInt(sysDict.getDictValue()); // 这个模型的积分消耗
        // 扣减用户积分
        userIntegralRecordService.changeUserIntegral(UserIntegralRecordTypeEnum.CREATE_MUSIC, creationId, musicCreation.getUserId(), -integral, null);

        // 插入创作表
        Date curDate = new Date();
        musicCreation.setCreationId(creationId);
        musicCreation.setSettings(JsonUtils.convertObj2Json(musicSettingDto));
        musicCreation.setCreateTime(curDate);
        this.add(musicCreation);

        // 处理歌词, 如果是高级模式, 则拼接音乐设置
        StringBuilder prompt = new StringBuilder(musicCreation.getPrompt());
        if (MusicModeTypeEnum.ADVANCED.getModeType().equals(musicCreation.getModeType())) {
            try {
                for (MusicSettingEnum musicSettingEnum : MusicSettingEnum.values()) {
                    PropertyDescriptor propertyDescriptor = new PropertyDescriptor(musicSettingEnum.getKeyCode(), MusicSettingDto.class);
                    Method readMethod = propertyDescriptor.getReadMethod();
                    Object value = readMethod.invoke(musicSettingDto);
                    if (value != null && !value.toString().trim().isEmpty()) {
                        log.info("value: {}", value);
                         prompt.append(String.format(";%s:%s", musicSettingEnum.getTypeDesc(), value));
                    }
                }
            } catch (Exception e) {
                log.error("获取音乐设置失败", e);
            }
        }

        ModelInfo modelInfo = getModelInfo(musicTypeEnum, musicCreation.getModel());
        String model = modelInfo.model; // 模型名称
        String apiCode = modelInfo.apiCode; // 模型接口
        MusicCreateApi musicCreateApi = (MusicCreateApi) springContext.getBean(apiCode);
        List<String> itemIds;
        if (MusicTypeEnum.MUSIC.equals(musicTypeEnum)) {
            itemIds = musicCreateApi.createMusic(model, prompt.toString(), musicCreation.getLyrics());
        } else {
            itemIds = musicCreateApi.createPureMusic(model, prompt.toString());
        }
        if (itemIds == null || itemIds.isEmpty()) {
            throw new BusinessException("音乐创建失败");
        }

        // 批量插入音乐表
        List<MusicInfo> musicInfoList = new ArrayList<>();
        List<String> musicIdList = new ArrayList<>();
        for (String item : itemIds) {
            MusicInfo musicInfo = new MusicInfo();
            musicInfo.setMusicId(StringTools.getRandomString(Constants.LENGTH_12));
            musicInfo.setUserId(musicCreation.getUserId());
            musicInfo.setTaskId(item);
            musicInfo.setCreationId(creationId);
            musicInfo.setMusicType(musicCreation.getMusicType());
            musicInfo.setPlayCount(Constants.ZERO);
            musicInfo.setGoodCount(Constants.ZERO);
            musicInfo.setCommendType(CommendTypeEnum.NOT_COMMENT.getCode());
            musicInfo.setCreateTime(curDate);
            musicInfo.setMusicStatus(MusicStatusEnum.CREATING.getCode());
            musicInfoList.add(musicInfo);

            musicIdList.add(musicInfo.getMusicId());

            if (appConfig.getAutoCheckMusic()) {
                MusicTaskDto musicTaskDto = new MusicTaskDto();
                musicTaskDto.setMusicId(musicInfo.getMusicId());
                musicTaskDto.setTaskId(item);
                musicTaskDto.setApiCode(apiCode);
                musicTaskDto.setMusicType(musicCreation.getMusicType());
                redisComponent.addMusicCreateTask(musicTaskDto);
            }
        }

        musicInfoMapper.insertBatch(musicInfoList);
        return musicIdList;
    }

    record ModelInfo(String model, String apiCode) {
    }

    /*
     * 根据音乐类型和模型ID获取模型信息
     * */
    private ModelInfo getModelInfo(MusicTypeEnum musicTypeEnum, String modelId) {
        if (musicTypeEnum == MusicTypeEnum.MUSIC) {
            ModelType4MusicEnum musicEnum = ModelType4MusicEnum.getById(modelId);
            if (musicEnum == null) {
                throw new BusinessException(ResponseCodeEnum.CODE_600);
            }
            return new ModelInfo(musicEnum.getModelCode(), musicEnum.getApiCode());
        } else if (musicTypeEnum == MusicTypeEnum.PURE) {
            ModelType4PureMusicEnum musicEnum = ModelType4PureMusicEnum.getById(modelId);
            if (musicEnum == null) {
                throw new BusinessException(ResponseCodeEnum.CODE_600);
            }
            return new ModelInfo(musicEnum.getModelCode(), musicEnum.getApiCode());
        } else {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
    }
}