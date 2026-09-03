package com.yymusic.entity.enums;

public enum MusicStatusEnum {
    CREATING(0, "音乐生成中"),
    CREATED(1, "音乐生成完成"),
    CREATE_FAIL(2, "音乐生成失败");

    private final Integer code;
    private final String info;

    MusicStatusEnum(Integer code, String info) {
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
