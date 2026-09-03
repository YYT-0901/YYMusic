package com.yymusic.entity.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class AppConfig {
    @Value("${project.folder:}")
    private String projectFolder;

    @Value("${admin.account:admin}")
    private String adminAccount;

    @Value("${admin.password:admin123456}")
    private String adminPassword;

    @Value("${tianpuyue.api.key:}")
    private String tianpuyueApiKey;

    @Value("${tianpuyue.api.domain:https://api.tianpuyue.cn}")
    private String tianpuyueApiDomain;

    @Value("${web.domain:}")
    private String webDomain;

    //微信支付 appid
    @Value("${pay.wechat.appid:}")
    private String payWechatAppId;

    @Value("${pay.wechat.mchid:}")
    private String payWechatMchid;

    //整数
    @Value("${pay.wechat.serialNo:}")
    private String payWechatSerialNo;

    //api密钥
    @Value("${pay.wechat.apiclientKeypath:}")
    private String payWechataApiclientKeyPath;

    // v3key密钥
    @Value("${pay.wechat.apiV3key:}")
    private String payWechatApiV3Key;

    // 支付宝支付 appid
    @Value("${pay.alipay.appId:}")
    private String payAlipayAppId;

    // 应用私钥
    @Value("${pay.alipay.appPrivateKey:}")
    private String payAlipayAppPrivateKey;

    // 支付宝公钥
    @Value("${pay.alipay.alipayPublicKey:}")
    private String payAlipayAlipayPublicKey;

    // 支付域名
    @Value("${pay.alipay.payDomain:}")
    private String payAlipayPayDomain;

    //支付域名
    @Value("${pay.wechat.payDomain:}")
    private String payDomain;

    @Value("${auto.checkPay:false}")
    private Boolean autoCheckPay;

    @Value("${auto.checkMusic:false}")
    private Boolean autoCheckMusic;

    @Value("${payCode.expireTimeMinute:10}")
    private int payCodeExpireTimeMinute;

    @Value("${server.domain}")
    private String serverDomain;
}
