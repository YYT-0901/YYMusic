package com.yymusic.entiity.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateMusicDto {
    @NotEmpty
    @Size(max = 2000)
    private String prompt;

    @Size(max = 1500)
    private String lyrics;

    @NotNull
    private Integer musicType;

    @NotEmpty
    @Size(max = 200)
    private String model;

    @Size(max = 200)
    private String musicGener;

    @Size(max = 150)
    private String musicEmotion;

    @Size(max = 5)
    private String musicSex;

    private String musicChord;

    private String musicTone;

    @NotNull
    private Integer modeType;
}
