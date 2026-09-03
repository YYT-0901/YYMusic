package com.yymusic.entity.dto;

import lombok.Data;

@Data
public class PayOrderNotifyDto {
    /**
     * 订单号
     */
    private String orderId;
    /**
     * 支付订单号 通道订单号
     */
    private String channelOrderId;
}
