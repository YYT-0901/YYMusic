package com.yymusic.api;

import com.alipay.api.AlipayApiException;
import com.yymusic.entity.dto.PayOrderNotifyDto;

import java.math.BigDecimal;
import java.util.Map;

public interface PayChannelService {

    /**
     * 获取支付信息
     *
     * @param orderId
     * @param amount
     * @param productName
     * @return
     */
    String getPayUrl(String orderId, BigDecimal amount, String productName);

    /**
     * 校验支付回调
     *
     * @param params
     * @param jsonBody
     * @return
     */
    PayOrderNotifyDto checkPayNotify(Map<String, Object> params, String jsonBody) throws AlipayApiException;


    /**
     * 查询订单
     *
     * @param orderId
     * @return
     */
    PayOrderNotifyDto queryOrder(String orderId) throws AlipayApiException;

}