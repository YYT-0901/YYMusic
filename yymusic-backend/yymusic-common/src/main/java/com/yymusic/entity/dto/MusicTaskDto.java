package com.yymusic.entity.dto;

import lombok.Data;

@Data
public class MusicTaskDto {
    private String musicId;
    private String taskId;
    private String apiCode;
    private Integer musicType;
}
