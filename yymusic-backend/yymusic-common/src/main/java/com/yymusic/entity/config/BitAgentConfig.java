package com.yymusic.entity.config;

import lombok.Data;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bit-agent")
@Data
public class BitAgentConfig {
    private String apiBaseUrl;
    private String appKeyPolishAgent;
    private String appKeyLyricsAgent;
    private String appKeyLineupAgent;
    private String userId;
    private String apiKeyPolishAgent;
    private String apiKeyLyricsAgent;
    private String apiKeyLineupAgent;
}

