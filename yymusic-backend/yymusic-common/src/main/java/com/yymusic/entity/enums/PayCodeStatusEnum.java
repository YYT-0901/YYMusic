package com.yymusic.entity.enums;

public enum PayCodeStatusEnum {
    NO_USE(0, "未使用"),
    USED(1, "已使用");

    private final Integer code;
    private final String info;

    PayCodeStatusEnum(Integer code, String info) {
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
