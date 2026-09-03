package com.yymusic.ai.service;

import com.yymusic.ai.config.AiProviderProperties;
import com.yymusic.entity.enums.AiProviderEnum;
import com.yymusic.exception.BusinessException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class AiChatClientRouter {

    private final ChatClient openaiChatClient;
    private final ChatClient ollamaChatClient;
    private final AiProviderProperties aiProviderProperties;

    public AiChatClientRouter(@Qualifier("openaiChatClient") ChatClient openaiChatClient,
                              @Qualifier("ollamaChatClient") ChatClient ollamaChatClient,
                              AiProviderProperties aiProviderProperties) {
        this.openaiChatClient = openaiChatClient;
        this.ollamaChatClient = ollamaChatClient;
        this.aiProviderProperties = aiProviderProperties;
    }

    public ChatClient getChatClient(String provider) {
        AiProviderEnum aiProviderEnum = resolveProviderEnum(provider);
        return getChatClient(aiProviderEnum);
    }

    public ChatClient getChatClient(AiProviderEnum aiProviderEnum) {
        return switch (aiProviderEnum) {
            case OPENAI -> openaiChatClient;
            case OLLAMA -> ollamaChatClient;
        };
    }

    public String resolveProviderCode(String provider) {
        return resolveProviderEnum(provider).getCode();
    }

    public AiProviderEnum resolveProviderEnum(String provider) {
        String targetProvider = provider;
        if (targetProvider == null || targetProvider.trim().isEmpty()) {
            targetProvider = aiProviderProperties.getDefaultProvider();
        }
        AiProviderEnum aiProviderEnum = AiProviderEnum.getByCode(targetProvider);
        if (aiProviderEnum == null) {
            throw new BusinessException("不支持的 AI provider: " + targetProvider + "，仅支持 openai 或 ollama");
        }
        return aiProviderEnum;
    }
}
