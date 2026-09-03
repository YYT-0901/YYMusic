package com.yymusic.controller;

import com.yymusic.annotation.GlobalInterceptor;
import com.yymusic.api.BitAgentService;
import com.yymusic.entiity.dto.PolishTextDto;
import com.yymusic.entity.enums.AgentTypeEnum;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.spring.SpringContext;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/agent")
@Slf4j
public class AgentController extends ABaseController {

    @Resource
    private SpringContext springContext;

    public AgentController(SpringContext springContext) {
        super();
        this.springContext = springContext;
    }

    @PostMapping("/aiGen")
    @GlobalInterceptor(checkLogin = true)
    public void polishTextOrLyricsGen(@RequestBody PolishTextDto polishTextDto, HttpServletResponse response) {
        AgentTypeEnum agentTypeEnum = AgentTypeEnum.getByCode(polishTextDto.getType());
        if(agentTypeEnum == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        try {
            // 创建会话
            BitAgentService bitAgentService = (BitAgentService) springContext.getBean(agentTypeEnum.getInfo());
            String conversationId = bitAgentService.createConversation();

            bitAgentService.queryStreaming(
                    conversationId,
                    polishTextDto.getText(),
                    response.getOutputStream()
            );
        } catch (IOException e) {
            log.error(e.getMessage());
        }
    }

    /*@PostMapping("/aiGenBlocking")
    public ResponseVO getLyricsBlocking(@RequestBody PolishTextDto polishTextDto) {
        AgentTypeEnum agentTypeEnum = AgentTypeEnum.getByCode(polishTextDto.getType());
        if(agentTypeEnum == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        try {
            BitAgentService bitAgentService = (BitAgentService) springContext.getBean(agentTypeEnum.getInfo());
            String conversationId = bitAgentService.createConversation();
            return getSuccessResponseVO(bitAgentService.queryBlocking(conversationId, polishTextDto.getText()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }*/
}
