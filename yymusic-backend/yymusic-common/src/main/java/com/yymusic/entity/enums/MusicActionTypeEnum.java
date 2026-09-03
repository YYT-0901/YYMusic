package com.yymusic.entity.enums;

public enum MusicActionTypeEnum {
    GOOD(0, "点赞");

    private final Integer code;
    private final String info;

    MusicActionTypeEnum(Integer code, String info) {
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
