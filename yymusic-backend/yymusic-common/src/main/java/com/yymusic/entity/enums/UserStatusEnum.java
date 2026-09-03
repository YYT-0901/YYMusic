package com.yymusic.entity.enums;

public enum UserStatusEnum {
    DISABLE(0, "禁用"),
    ENABLE(1, "启用");

    private final Integer code;
    private final String info;

    UserStatusEnum(Integer code, String info) {
        this.code = code;
        this.info = info;
    }

    public Integer getCode() {
        return code;
    }

    public String getInfo() {
        return info;
    }

    public static String getInfoByCode(Integer code) {
    	for(UserStatusEnum userStatusEnum : UserStatusEnum.values()) {
    		if(userStatusEnum.getCode().equals(code)) {
    			return userStatusEnum.getInfo();
    		}
    	}
    	return null;
    }
}
