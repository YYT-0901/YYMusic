package com.yymusic.entity.dto;

import lombok.Data;

@Data
public class MusicSettingDto {

    /*
    * 音乐风格
    * */
    private String musicGener;

    /*
    * 音乐情感
    * */
    private String musicEmotion;

    /*
    * 人声
    * */
    private String musicSex;

    /*
    * 和弦进行
    * */
    private String musicChord;

    /*
    * 调性
    * */
    private String musicTone;
}
