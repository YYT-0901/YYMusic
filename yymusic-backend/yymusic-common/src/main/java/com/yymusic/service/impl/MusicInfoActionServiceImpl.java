package com.yymusic.service.impl;

import java.util.List;

import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.enums.MusicActionTypeEnum;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.mappers.MusicInfoMapper;
import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import com.yymusic.entity.enums.PageSize;
import com.yymusic.entity.query.MusicInfoActionQuery;
import com.yymusic.entity.po.MusicInfoAction;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.mappers.MusicInfoActionMapper;
import com.yymusic.service.MusicInfoActionService;
import com.yymusic.utils.StringTools;
import org.springframework.transaction.annotation.Transactional;


/**
 * 音乐操作 业务接口实现
 */
@Service("musicInfoActionService")
public class MusicInfoActionServiceImpl implements MusicInfoActionService {

    @Resource
    private MusicInfoActionMapper<MusicInfoAction, MusicInfoActionQuery> musicInfoActionMapper;
    @Resource
    private MusicInfoMapper<MusicInfo, MusicInfoQuery> musicInfoMapper;

    /**
     * 根据条件查询列表
     */
    @Override
    public List<MusicInfoAction> findListByParam(MusicInfoActionQuery param) {
        return this.musicInfoActionMapper.selectList(param);
    }

    /**
     * 根据条件查询列表
     */
    @Override
    public Integer findCountByParam(MusicInfoActionQuery param) {
        return this.musicInfoActionMapper.selectCount(param);
    }

    /**
     * 分页查询方法
     */
    @Override
    public PaginationResultVO<MusicInfoAction> findListByPage(MusicInfoActionQuery param) {
        int count = this.findCountByParam(param);
        int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

        SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
        param.setSimplePage(page);
        List<MusicInfoAction> list = this.findListByParam(param);
        PaginationResultVO<MusicInfoAction> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
        return result;
    }

    /**
     * 新增
     */
    @Override
    public Integer add(MusicInfoAction bean) {
        return this.musicInfoActionMapper.insert(bean);
    }

    /**
     * 批量新增
     */
    @Override
    public Integer addBatch(List<MusicInfoAction> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.musicInfoActionMapper.insertBatch(listBean);
    }

    /**
     * 批量新增或者修改
     */
    @Override
    public Integer addOrUpdateBatch(List<MusicInfoAction> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.musicInfoActionMapper.insertOrUpdateBatch(listBean);
    }

    /**
     * 多条件更新
     */
    @Override
    public Integer updateByParam(MusicInfoAction bean, MusicInfoActionQuery param) {
        StringTools.checkParam(param);
        return this.musicInfoActionMapper.updateByParam(bean, param);
    }

    /**
     * 多条件删除
     */
    @Override
    public Integer deleteByParam(MusicInfoActionQuery param) {
        StringTools.checkParam(param);
        return this.musicInfoActionMapper.deleteByParam(param);
    }

    /**
     * 根据ActionId获取对象
     */
    @Override
    public MusicInfoAction getMusicInfoActionByActionId(Integer actionId) {
        return this.musicInfoActionMapper.selectByActionId(actionId);
    }

    /**
     * 根据ActionId修改
     */
    @Override
    public Integer updateMusicInfoActionByActionId(MusicInfoAction bean, Integer actionId) {
        return this.musicInfoActionMapper.updateByActionId(bean, actionId);
    }

    /**
     * 根据ActionId删除
     */
    @Override
    public Integer deleteMusicInfoActionByActionId(Integer actionId) {
        return this.musicInfoActionMapper.deleteByActionId(actionId);
    }

    /**
     * 根据MusicIdAndUserId获取对象
     */
    @Override
    public MusicInfoAction getMusicInfoActionByMusicIdAndUserId(String musicId, String userId) {
        return this.musicInfoActionMapper.selectByMusicIdAndUserId(musicId, userId);
    }

    /**
     * 根据MusicIdAndUserId修改
     */
    @Override
    public Integer updateMusicInfoActionByMusicIdAndUserId(MusicInfoAction bean, String musicId, String userId) {
        return this.musicInfoActionMapper.updateByMusicIdAndUserId(bean, musicId, userId);
    }

    /**
     * 根据MusicIdAndUserId删除
     */
    @Override
    public Integer deleteMusicInfoActionByMusicIdAndUserId(String musicId, String userId) {
        return this.musicInfoActionMapper.deleteByMusicIdAndUserId(musicId, userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void doGood(String musicId, String userId) {
        MusicInfo musicInfo = this.musicInfoMapper.selectByMusicId(musicId);
        if (musicInfo == null) {
            return;
        }
        MusicInfoAction musicInfoAction = this.musicInfoActionMapper.selectByMusicIdAndUserId(musicId, userId);
        if (musicInfoAction != null) {
            this.musicInfoActionMapper.deleteByMusicIdAndUserId(musicId, userId);
            this.musicInfoMapper.updateMusicGoodCountByMusicId(musicId, -Constants.ONE);
            return;
        }
        musicInfoAction = new MusicInfoAction();
        musicInfoAction.setMusicId(musicId);
        musicInfoAction.setMusicUserId(musicInfo.getUserId());
        musicInfoAction.setUserId(userId);
        musicInfoAction.setActionType(MusicActionTypeEnum.GOOD.getCode());
        this.musicInfoActionMapper.insert(musicInfoAction);
        this.musicInfoMapper.updateMusicGoodCountByMusicId(musicId, Constants.ONE);
    }
}