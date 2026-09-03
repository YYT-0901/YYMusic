package com.yymusic.entity.enums;

public enum AlipayTradeStatusEnum {
    WAIT_BUYER_PAY("WAIT_BUYER_PAY", "待付款"),
    TRADE_CLOSED("TRADE_CLOSED", "已关闭"),
    TRADE_SUCCESS("TRADE_SUCCESS", "支付成功"),
    TRADE_FINISHED("TRADE_FINISHED", "已完成");

    private final String code;
    private final String info;

    AlipayTradeStatusEnum(String code, String info) {
        this.code = code;
        this.info = info;
    }

     public String getCode() {
        return code;
    }

     public String getInfo() {
        return info;
    }
}
