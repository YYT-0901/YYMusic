package com.yymusic.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class PayCodeInfoWithUserDto {

    /**
	 * 支付码
	 */
	private String payCode;

	/**
	 * 金额
	 */
	private BigDecimal amount;

	/**
	 * 创建时间
	 */
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private Date createTime;

	/**
	 * 使用用户ID
	 */
	private String useUserId;

	/**
	 * 使用时间
	 */
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private Date useTime;

	/**
	 * 状态 0:待使用 1:已使用
	 */
	private Integer status;

    private String nickName;
}
