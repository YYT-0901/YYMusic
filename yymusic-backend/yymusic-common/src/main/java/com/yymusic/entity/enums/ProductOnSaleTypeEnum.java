package com.yymusic.entity.enums;

public enum ProductOnSaleTypeEnum {
    ON_SALE(1, "在售"),
    NOT_ON_SALE(0, "未售");

    private final Integer code;
    private final String info;

    ProductOnSaleTypeEnum(Integer code, String info) {
        this.code = code;
        this.info = info;
    }

    public Integer getCode() {
        return code;
    }

     public String getInfo() {
        return info;
    }
}
