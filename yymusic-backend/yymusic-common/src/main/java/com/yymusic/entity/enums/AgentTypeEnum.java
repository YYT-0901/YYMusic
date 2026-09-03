package com.yymusic.entity.enums;

public enum AgentTypeEnum {
    POLISH_AGENT(0, "polishAgent"),
    LYRICS_AGENT(1, "lyricsAgent");

    private final int code;
    private final String info;

    AgentTypeEnum(int code, String info) {
        this.code = code;
        this.info = info;
    }

    public int getCode() {
        return code;
    }

    public String getInfo() {
        return info;
    }

    public static AgentTypeEnum getByCode(int code) {
        for (AgentTypeEnum value : AgentTypeEnum.values()) {
            if (value.getCode() == code) {
                return value;
            }
        }
        return null;
    }
}
