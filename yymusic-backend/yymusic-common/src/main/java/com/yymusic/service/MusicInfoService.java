package com.yymusic.service;

import java.util.List;

import com.yymusic.entity.dto.MusicCreationResultDto;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.vo.MusicInfoVO;
import com.yymusic.entity.vo.PaginationResultVO;
import org.springframework.web.multipart.MultipartFile;


/**
 * 音乐信息 业务接口
 */
public interface MusicInfoService {

	/**
	 * 根据条件查询列表
	 */
	List<MusicInfo> findListByParam(MusicInfoQuery param);

	/**
	 * 根据条件查询列表
	 */
	Integer findCountByParam(MusicInfoQuery param);

	/**
	 * 分页查询
	 */
	PaginationResultVO<MusicInfo> findListByPage(MusicInfoQuery param);

	/**
	 * 新增
	 */
	Integer add(MusicInfo bean);

	/**
	 * 批量新增
	 */
	Integer addBatch(List<MusicInfo> listBean);

	/**
	 * 批量新增/修改
	 */
	Integer addOrUpdateBatch(List<MusicInfo> listBean);

	/**
	 * 多条件更新
	 */
	Integer updateByParam(MusicInfo bean,MusicInfoQuery param);

	/**
	 * 多条件删除
	 */
	Integer deleteByParam(MusicInfoQuery param);

	/**
	 * 根据MusicId查询对象
	 */
	MusicInfo getMusicInfoByMusicId(String musicId);


	/**
	 * 根据MusicId修改
	 */
	Integer updateMusicInfoByMusicId(MusicInfo bean,String musicId);


	/**
	 * 根据MusicId删除
	 */
	Integer deleteMusicInfoByMusicId(String musicId);


	/**
	 * 根据TaskId查询对象
	 */
	MusicInfo getMusicInfoByTaskId(String taskId);


	/**
	 * 根据TaskId修改
	 */
	Integer updateMusicInfoByTaskId(MusicInfo bean,String taskId);


	/**
	 * 根据TaskId删除
	 */
	Integer deleteMusicInfoByTaskId(String taskId);

    List<MusicInfoVO> findListByParamWithJoin(MusicInfoQuery musicInfoQuery);

	PaginationResultVO<MusicInfoVO> findListByPageWithJoin(MusicInfoQuery musicInfoQuery);

	MusicInfoVO getMusicInfoVOByMusicId(String musicId);

	void updateMusicPlayCountByMusicId(String musicId);

    void musicCreateNotify(Integer musicType, String body, String model);

	void musicCreated(MusicCreationResultDto musicCreationResultDto);

	String uploadCover(String userId, String musicId, MultipartFile file);

	void delMusic(String userId, String musicId);
}