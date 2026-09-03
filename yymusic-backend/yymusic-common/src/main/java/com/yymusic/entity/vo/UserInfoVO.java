package com.yymusic.entity.vo;

import lombok.Data;


import java.io.Serializable;

@Data
public class UserInfoVO implements Serializable {

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 昵称
     */
    private String nickName;

    /**
     * 用户头像
     */
    private String avatar;

    private Integer musicCount;

    private Integer goodCount;


}
