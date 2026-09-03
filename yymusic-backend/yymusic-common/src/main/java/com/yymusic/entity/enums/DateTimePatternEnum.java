package com.yymusic.entity.enums;


public enum DateTimePatternEnum {
    YYYY_MM_DD_HH_MM_SS("yyyy-MM-dd HH:mm:ss"), YYYY_MM_DD("yyyy-MM-dd"), YYYYMMDD("yyyyMMdd"), YYYYMMDDHHMMSS("yyyyMMddHHmmss"), YYYY_MM_DDTHH_MM_SS("yyyy-MM-dd'T'HH:mm:ssXXX"), YYYYMM("yyyyMM");

    private String pattern;

    DateTimePatternEnum(String pattern) {
        this.pattern = pattern;
    }

    public String getPattern() {
        return pattern;
    }
}
