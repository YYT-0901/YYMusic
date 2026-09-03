package com.yymusic.service;

import java.util.List;

import com.yymusic.entity.dto.PayCodeInfoWithUserDto;
import com.yymusic.entity.query.PayCodeInfoQuery;
import com.yymusic.entity.po.PayCodeInfo;
import com.yymusic.entity.vo.PaginationResultVO;


/**
 * 支付码 业务接口
 */
public interface PayCodeInfoService {

	/**
	 * 根据条件查询列表
	 */
	List<PayCodeInfo> findListByParam(PayCodeInfoQuery param);

	/**
	 * 根据条件查询列表
	 */
	Integer findCountByParam(PayCodeInfoQuery param);

	/**
	 * 分页查询
	 */
	PaginationResultVO<PayCodeInfo> findListByPage(PayCodeInfoQuery param);

	/**
	 * 新增
	 */
	Integer add(PayCodeInfo bean);

	/**
	 * 批量新增
	 */
	Integer addBatch(List<PayCodeInfo> listBean);

	/**
	 * 批量新增/修改
	 */
	Integer addOrUpdateBatch(List<PayCodeInfo> listBean);

	/**
	 * 多条件更新
	 */
	Integer updateByParam(PayCodeInfo bean,PayCodeInfoQuery param);

	/**
	 * 多条件删除
	 */
	Integer deleteByParam(PayCodeInfoQuery param);

	/**
	 * 根据PayCode查询对象
	 */
	PayCodeInfo getPayCodeInfoByPayCode(String payCode);


	/**
	 * 根据PayCode修改
	 */
	Integer updatePayCodeInfoByPayCode(PayCodeInfo bean,String payCode);


	/**
	 * 根据PayCode删除
	 */
	Integer deletePayCodeInfoByPayCode(String payCode);

	List<PayCodeInfoWithUserDto> findListByParamWithUser(PayCodeInfoQuery payCodeInfoQuery);

	PaginationResultVO<PayCodeInfoWithUserDto> findListByPageWithUser(PayCodeInfoQuery payCodeInfoQuery);
}