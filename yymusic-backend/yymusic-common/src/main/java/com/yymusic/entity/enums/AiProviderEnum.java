package com.yymusic.entity.enums;

import com.yymusic.utils.StringTools;

public enum AiProviderEnum {
    OLLAMA("ollama", "Ollama"),
    OPENAI("openai", "OpenAI");

    private final String code;
    private final String info;

    AiProviderEnum(String code, String info) {
        this.code = code;
        this.info = info;
    }

    public static AiProviderEnum getByCode(String code) {
        if (StringTools.isEmpty(code)) {
            return null;
        }
        for (AiProviderEnum value : AiProviderEnum.values()) {
            if (value.getCode().equalsIgnoreCase(code.trim())) {
                return value;
            }
        }
        return null;
    }

    public String getCode() {
        return code;
    }

    public String getInfo() {
        return info;
    }
}
