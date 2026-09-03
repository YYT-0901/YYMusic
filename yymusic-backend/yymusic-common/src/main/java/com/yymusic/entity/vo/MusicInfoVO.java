package com.yymusic.entity.vo;

import com.yymusic.entity.po.MusicInfo;

public class MusicInfoVO extends MusicInfo {
    private String avatar;

    private String nickName;

    private Boolean doGood;

    public Boolean getDoGood() {
        return doGood;
    }

    public void setDoGood(Boolean doGood) {
        this.doGood = doGood;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }
}
