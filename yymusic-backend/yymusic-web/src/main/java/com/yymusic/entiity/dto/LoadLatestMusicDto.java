package com.yymusic.entiity.dto;

import lombok.Data;

@Data
public class LoadLatestMusicDto {
    private Integer pageNo = 1;
    private Integer sortType;
}
