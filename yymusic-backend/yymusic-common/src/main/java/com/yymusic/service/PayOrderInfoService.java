package com.yymusic.service;

import java.util.List;
import java.util.Map;

import com.alipay.api.AlipayApiException;
import com.yymusic.entity.dto.PayInfoDto;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.query.PayOrderInfoQuery;
import com.yymusic.entity.po.PayOrderInfo;
import com.yymusic.entity.vo.PaginationResultVO;


/**
 * 支付订单信息 业务接口
 */
public interface PayOrderInfoService {

	/**
	 * 根据条件查询列表
	 */
	List<PayOrderInfo> findListByParam(PayOrderInfoQuery param);

	/**
	 * 根据条件查询列表
	 */
	Integer findCountByParam(PayOrderInfoQuery param);

	/**
	 * 分页查询
	 */
	PaginationResultVO<PayOrderInfo> findListByPage(PayOrderInfoQuery param);

	/**
	 * 新增
	 */
	Integer add(PayOrderInfo bean);

	/**
	 * 批量新增
	 */
	Integer addBatch(List<PayOrderInfo> listBean);

	/**
	 * 批量新增/修改
	 */
	Integer addOrUpdateBatch(List<PayOrderInfo> listBean);

	/**
	 * 多条件更新
	 */
	Integer updateByParam(PayOrderInfo bean,PayOrderInfoQuery param);

	/**
	 * 多条件删除
	 */
	Integer deleteByParam(PayOrderInfoQuery param);

	/**
	 * 根据OrderId查询对象
	 */
	PayOrderInfo getPayOrderInfoByOrderId(String orderId);


	/**
	 * 根据OrderId修改
	 */
	Integer updatePayOrderInfoByOrderId(PayOrderInfo bean,String orderId);


	/**
	 * 根据OrderId删除
	 */
	Integer deletePayOrderInfoByOrderId(String orderId);

    PayInfoDto getPayInfo(TokenUserInfoDto tokenUserInfoDto, String productId, Integer payType);

	void payNotify(Integer payType, Map<String, Object> params, String body) throws AlipayApiException;

    void processPayOrderSuccess(PayOrderInfo payOrderInfo, String channelOrderId);

	void buyByPayCode(String productId, String payCode, String userId);

	Integer checkHavePay(String orderId, String userId);
}