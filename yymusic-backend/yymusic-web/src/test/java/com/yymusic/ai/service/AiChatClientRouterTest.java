package com.yymusic.ai.service;

import com.yymusic.ai.config.AiProviderProperties;
import com.yymusic.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class AiChatClientRouterTest {

    @Test
    void shouldReturnConfiguredDefaultProviderWhenProviderIsBlank() {
        ChatClient openaiChatClient = mock(ChatClient.class);
        ChatClient ollamaChatClient = mock(ChatClient.class);
        AiProviderProperties aiProviderProperties = new AiProviderProperties();
        aiProviderProperties.setDefaultProvider("ollama");

        AiChatClientRouter router = new AiChatClientRouter(openaiChatClient, ollamaChatClient, aiProviderProperties);

        assertSame(ollamaChatClient, router.getChatClient((String) null));
        assertSame(ollamaChatClient, router.getChatClient(" "));
    }

    @Test
    void shouldRouteToExplicitProvider() {
        ChatClient openaiChatClient = mock(ChatClient.class);
        ChatClient ollamaChatClient = mock(ChatClient.class);
        AiProviderProperties aiProviderProperties = new AiProviderProperties();

        AiChatClientRouter router = new AiChatClientRouter(openaiChatClient, ollamaChatClient, aiProviderProperties);

        assertSame(openaiChatClient, router.getChatClient("openai"));
        assertSame(ollamaChatClient, router.getChatClient("ollama"));
    }

    @Test
    void shouldRejectUnsupportedProvider() {
        ChatClient openaiChatClient = mock(ChatClient.class);
        ChatClient ollamaChatClient = mock(ChatClient.class);
        AiProviderProperties aiProviderProperties = new AiProviderProperties();

        AiChatClientRouter router = new AiChatClientRouter(openaiChatClient, ollamaChatClient, aiProviderProperties);

        assertThrows(BusinessException.class, () -> router.getChatClient("claude"));
    }
}
