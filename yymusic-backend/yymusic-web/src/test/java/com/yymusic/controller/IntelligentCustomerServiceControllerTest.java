package com.yymusic.controller;

import com.yymusic.ai.service.AiChatClientRouter;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.AiProviderEnum;
import com.yymusic.redis.RedisComponent;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.mock.web.MockHttpServletRequest;
import reactor.core.publisher.Flux;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class IntelligentCustomerServiceControllerTest {

    private static final String TOKEN = "token-1";
    private static final String USER_ID = "user-001";

    @Test
    void shouldFallbackToSingleCallForOllamaStreaming() {
        AiChatClientRouter aiChatClientRouter = mock(AiChatClientRouter.class);
        RedisComponent redisComponent = mockRedisComponent();
        ChatClient chatClient = mock(ChatClient.class, RETURNS_DEEP_STUBS);
        when(aiChatClientRouter.resolveProviderEnum("ollama")).thenReturn(AiProviderEnum.OLLAMA);
        when(aiChatClientRouter.getChatClient(AiProviderEnum.OLLAMA)).thenReturn(chatClient);
        when(chatClient.prompt().toolContext(anyMap()).user("hello").call().content()).thenReturn("full-response");

        IntelligentCustomerServiceController controller = new IntelligentCustomerServiceController(aiChatClientRouter, redisComponent);

        List<String> result = controller.chatStream("hello", "ollama", mockRequest()).collectList().block();

        assertEquals(List.of("full-response"), result);
    }

    @Test
    void shouldKeepStreamingForOpenAi() {
        AiChatClientRouter aiChatClientRouter = mock(AiChatClientRouter.class);
        RedisComponent redisComponent = mockRedisComponent();
        ChatClient chatClient = mock(ChatClient.class, RETURNS_DEEP_STUBS);
        when(aiChatClientRouter.resolveProviderEnum("openai")).thenReturn(AiProviderEnum.OPENAI);
        when(aiChatClientRouter.getChatClient(AiProviderEnum.OPENAI)).thenReturn(chatClient);
        when(chatClient.prompt().toolContext(anyMap()).user("hello").stream().content()).thenReturn(Flux.just("part-1", "part-2"));

        IntelligentCustomerServiceController controller = new IntelligentCustomerServiceController(aiChatClientRouter, redisComponent);

        List<String> result = controller.chatStream("hello", "openai", mockRequest()).collectList().block();

        assertEquals(List.of("part-1", "part-2"), result);
    }

    private RedisComponent mockRedisComponent() {
        TokenUserInfoDto tokenUserInfoDto = new TokenUserInfoDto();
        tokenUserInfoDto.setToken(TOKEN);
        tokenUserInfoDto.setUserId(USER_ID);

        RedisComponent redisComponent = mock(RedisComponent.class);
        when(redisComponent.getTokenUserInfoDto(TOKEN)).thenReturn(tokenUserInfoDto);
        return redisComponent;
    }

    private MockHttpServletRequest mockRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(Constants.TOKEN, TOKEN);
        return request;
    }
}
