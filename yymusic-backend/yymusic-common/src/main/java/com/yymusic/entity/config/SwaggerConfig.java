package com.yymusic.entity.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    private final String TITLE = "YYMusic API文档";
    private final String DESCRIPTION = "YYMusic 客户端应用接口文档";
    private final String VERSION = "v1.0.0";
    private final String CONTACT_NAME = "Developer Name";
    private final String CONTACT_EMAIL = "developer@example.com";
    private final String CONTACT_URL = "https://example.com";

    @Bean
    public OpenAPI selfOpenAPI() {
        return new OpenAPI().info(new Info()
                .title(TITLE)
                .description(DESCRIPTION)
                .version(VERSION)
                .contact(new Contact()
                        .name(CONTACT_NAME)
                        .email(CONTACT_EMAIL)
                        .url(CONTACT_URL)));
    }
}