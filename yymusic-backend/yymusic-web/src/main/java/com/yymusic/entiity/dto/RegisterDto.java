package com.yymusic.entiity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterDto {

    @NotEmpty(message = "验证码key不能为空")
    private String checkCodeKey;

    @NotEmpty(message = "验证码不能为空")
    private String checkCode;

    @NotEmpty(message = "邮箱不能为空")
    @Email
    @Size(max = 50)
    private String email;

    @NotEmpty(message = "密码不能为空")
    @Size(min = 8, max = 18)
    private String password;

    @NotEmpty(message = "昵称不能为空")
    @Size(max = 20)
    private String nickName;

}
