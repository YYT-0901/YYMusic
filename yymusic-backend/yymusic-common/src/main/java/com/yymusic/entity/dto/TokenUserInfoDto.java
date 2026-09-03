package com.yymusic.entity.dto;

import lombok.Data;

@Data
public class TokenUserInfoDto {
    private String userId;
    private String nickName;
    private String token;
    private String avatar;
    private Integer integral;
}
