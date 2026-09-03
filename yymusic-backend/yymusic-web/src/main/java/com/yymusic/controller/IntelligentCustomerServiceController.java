package com.yymusic.controller;

import com.yymusic.ai.config.MusicAgentTools;
import com.yymusic.ai.service.AiChatClientRouter;
import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.AiProviderEnum;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.utils.StringTools;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class IntelligentCustomerServiceController extends ABaseController {

    private final AiChatClientRouter aiChatClientRouter;
    private final RedisComponent redisComponent;

    public IntelligentCustomerServiceController(AiChatClientRouter aiChatClientRouter,
                                                RedisComponent redisComponent) {
        this.aiChatClientRouter = aiChatClientRouter;
        this.redisComponent = redisComponent;
    }

    @GetMapping("/chat")
    @GlobalInterceptor(checkLogin = true)
    public String chat(@RequestParam String message,
                       @RequestParam(required = false) String provider,
                       HttpServletRequest request) {
        return doChat(message, provider, request);
    }

    @GetMapping("/chat/{provider}")
    @GlobalInterceptor(checkLogin = true)
    public String chatByProvider(@PathVariable String provider,
                                 @RequestParam String message,
                                 HttpServletRequest request) {
        return doChat(message, provider, request);
    }

    @GetMapping("/chatStream")
    @GlobalInterceptor(checkLogin = true)
    public Flux<String> chatStream(@RequestParam String message,
                                   @RequestParam(required = false) String provider,
                                   HttpServletRequest request) {
        return doChatStream(message, provider, request);
    }

    @GetMapping("/chatStream/{provider}")
    @GlobalInterceptor(checkLogin = true)
    public Flux<String> chatStreamByProvider(@PathVariable String provider,
                                             @RequestParam String message,
                                             HttpServletRequest request) {
        return doChatStream(message, provider, request);
    }

    private String doChat(String message, String provider, HttpServletRequest request) {
        AiProviderEnum resolvedProvider = aiChatClientRouter.resolveProviderEnum(provider);
        Map<String, Object> toolContext = buildToolContext(request);
        return aiChatClientRouter.getChatClient(resolvedProvider)
                .prompt()
                .toolContext(toolContext)
                .user(message)
                .call()
                .content();
    }

    private Flux<String> doChatStream(String message, String provider, HttpServletRequest request) {
        AiProviderEnum resolvedProvider = aiChatClientRouter.resolveProviderEnum(provider);
        ChatClient chatClient = aiChatClientRouter.getChatClient(resolvedProvider);
        Map<String, Object> toolContext = buildToolContext(request);
        if (resolvedProvider == AiProviderEnum.OLLAMA) {
            // Spring AI 1.0.0-M5 may throw an NPE when aggregating Ollama stream metadata.
            return Mono.justOrEmpty(chatClient.prompt()
                    .toolContext(toolContext)
                    .user(message)
                    .call()
                    .content()).flux();
        }
        return chatClient
                .prompt()
                .toolContext(toolContext)
                .user(message)
                .stream()
                .content();
    }

    private Map<String, Object> buildToolContext(HttpServletRequest request) {
        if (request == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        String token = request.getHeader(Constants.TOKEN);
        if (StringTools.isEmpty(token)) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        TokenUserInfoDto tokenUserInfoDto = redisComponent.getTokenUserInfoDto(token);
        if (tokenUserInfoDto == null || StringTools.isEmpty(tokenUserInfoDto.getUserId())) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        return Map.of(MusicAgentTools.TOOL_CONTEXT_USER_ID, tokenUserInfoDto.getUserId());
    }
}
