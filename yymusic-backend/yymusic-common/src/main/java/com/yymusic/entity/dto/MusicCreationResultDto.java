package com.yymusic.entity.dto;

import lombok.Data;

import java.util.List;

@Data
public class MusicCreationResultDto {
    private String taskId;
    private String title;
    private Integer duration;
    private String audioUrl;
    private String audioHiUrl;
    private List<Lyrics> lyricsList;
    private Boolean isSuccess;

    @Data
    public static class Lyrics {
        private Integer start;
        private Integer end;
        private String text;
    }
}