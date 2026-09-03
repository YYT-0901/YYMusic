package com.yymusic.entity.enums;

public enum SortTypeEnum {
    NEW(1, "new"),
    HOT(0, "hot");

    private final Integer code;
    private final String info;

    SortTypeEnum(Integer code, String info) {
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
