package com.yymusic.entity.enums;

public enum CommendTypeEnum {
    NOT_COMMENT(0, "未推荐"),
    COMMENT(1, "已推荐");

    private final Integer code;
    private final String info;

    CommendTypeEnum(Integer code, String info) {
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
