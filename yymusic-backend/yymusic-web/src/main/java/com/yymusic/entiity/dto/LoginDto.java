package com.yymusic.entiity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginDto {
    @NotEmpty(message = "验证码KEY不能为空")
    private String checkCodeKey;

    @NotEmpty(message = "验证码不能为空")
    private String checkCode;

    @NotEmpty(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Size(max = 50, message = "邮箱长度不能超过50个字符")
    private String email;

    @NotEmpty
    private String password;
}
