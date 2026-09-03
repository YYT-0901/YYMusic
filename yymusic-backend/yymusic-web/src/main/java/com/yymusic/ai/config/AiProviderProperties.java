package com.yymusic.ai.config;

import com.yymusic.entity.enums.AiProviderEnum;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "yymusic.ai")
public class AiProviderProperties {

    private String defaultProvider = AiProviderEnum.OLLAMA.getCode();

    private String knowledgeProvider = AiProviderEnum.OLLAMA.getCode();

    public String getDefaultProvider() {
        return defaultProvider;
    }

    public void setDefaultProvider(String defaultProvider) {
        this.defaultProvider = defaultProvider;
    }

    public String getKnowledgeProvider() {
        return knowledgeProvider;
    }

    public void setKnowledgeProvider(String knowledgeProvider) {
        this.knowledgeProvider = knowledgeProvider;
    }
}
