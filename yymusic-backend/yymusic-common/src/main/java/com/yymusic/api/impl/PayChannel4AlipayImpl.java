package com.yymusic.api.impl;


import com.alibaba.fastjson2.JSONObject;
import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.AlipayConfig;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.AlipayTradeQueryModel;
import com.alipay.api.internal.util.AlipaySignature;
import com.alipay.api.request.AlipayTradePagePayRequest;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.dto.PayOrderNotifyDto;
import com.yymusic.entity.enums.AlipayTradeStatusEnum;
import com.yymusic.api.PayChannelService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service("payChannel4Alipay")
@Slf4j
public class PayChannel4AlipayImpl implements PayChannelService {
    private static final String FORMAT = "JSON";
    private static final String CHARSET = "UTF-8";
    //签名方式
    private static final String SIGN_TYPE = "RSA2";
    private static final String NOTIFY_URL = "/api/payNotify/payNotify4Alipay";
    private static final String RETURN_URL = "/recharge?orderId=%s";



    @Resource
    private AppConfig appConfig;

    @Override
    public String getPayUrl(String orderId, BigDecimal amount, String productName) {
        // 1. 创建Client，通用SDK提供的Client，负责调用支付宝的API
        AlipayClient alipayClient = new DefaultAlipayClient(appConfig.getPayAlipayPayDomain(), appConfig.getPayAlipayAppId(),
                appConfig.getPayAlipayAppPrivateKey(), FORMAT, CHARSET, appConfig.getPayAlipayAlipayPublicKey(), SIGN_TYPE);

        // 2. 创建 Request并设置Request参数
        AlipayTradePagePayRequest request = new AlipayTradePagePayRequest();  // 发送请求的 Request类
        request.setNotifyUrl(appConfig.getWebDomain() + NOTIFY_URL);
        JSONObject bizContent = new JSONObject();
        bizContent.put("out_trade_no", orderId);  // 我们自己生成的订单编号
        bizContent.put("total_amount", amount); // 订单的总金额
        bizContent.put("subject", productName);   // 支付的名称
        bizContent.put("product_code", "FAST_INSTANT_TRADE_PAY");  // 固定配置
        request.setBizContent(bizContent.toString());
        request.setReturnUrl(appConfig.getWebDomain() + String.format(RETURN_URL, orderId)); // 支付完成后自动跳转到本地页面的路径

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletResponse response = attributes.getResponse();

        String form = null;
        // 执行请求，拿到响应的结果，返回给浏览器
        try {
            form = alipayClient.pageExecute(request).getBody(); // 调用SDK生成表单

//            response.setContentType("text/html;charset=" + CHARSET);
//            response.getWriter().write(form);// 直接将完整的表单html输出到页面
//            response.getWriter().flush();
//            response.getWriter().close();
        } catch (Exception e) {
            log.error("支付宝支付失败", e);
        }
        return form;
    }

    private String extractActionUrlWithRegex(String str) {
        Pattern pattern = Pattern.compile("action\\s*=\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(str);

        if (matcher.find()) {
            // 处理转义字符
            String url = matcher.group(1);
            // 替换转义的双引号
            url = url.replace("\\\"", "\"");
            return url;
        }
        return null;
    }

    @Override
    public PayOrderNotifyDto queryOrder(String orderId) throws AlipayApiException {
        // 初始化SDK
        AlipayClient alipayClient = new DefaultAlipayClient(getAlipayConfig());

        // 构造请求参数以调用接口
        AlipayTradeQueryRequest request = new AlipayTradeQueryRequest();
        AlipayTradeQueryModel model = new AlipayTradeQueryModel();

        // 设置订单支付时传入的商户订单号
        model.setOutTradeNo(orderId);

        // 设置查询选项
        List<String> queryOptions = new ArrayList<String>();
        queryOptions.add("trade_settle_info");
        model.setQueryOptions(queryOptions);

        request.setBizModel(model);
        // 第三方代调用模式下请设置app_auth_token
        // request.putOtherTextParam("app_auth_token", "<-- 请填写应用授权令牌 -->");

        AlipayTradeQueryResponse response = alipayClient.execute(request);
        log.info("查询订单,orderId:{},response:{}", orderId, response.getBody());

        if (response.isSuccess()) {
            if(AlipayTradeStatusEnum.WAIT_BUYER_PAY.getCode().equals(response.getTradeStatus())) {
                return null;
            }
            System.out.println("调用成功");
            PayOrderNotifyDto payOrderNotifyDto = new PayOrderNotifyDto();
            payOrderNotifyDto.setOrderId(orderId);
            payOrderNotifyDto.setChannelOrderId(response.getTradeNo());
            return payOrderNotifyDto;
        } else {
            System.out.println("调用失败");
            // sdk版本是"4.38.0.ALL"及以上,可以参考下面的示例获取诊断链接
            // String diagnosisUrl = DiagnosisUtils.getDiagnosisUrl(response);
            // System.out.println(diagnosisUrl);
        }
        return null;
    }

    private AlipayConfig getAlipayConfig() {
        String privateKey  = appConfig.getPayAlipayAppPrivateKey(); // "<-- 请填写您的应用私钥，例如：MIIEvQIBADANB ... ... -->";
        String alipayPublicKey = appConfig.getPayAlipayAlipayPublicKey(); // "<-- 请填写您的支付宝公钥，例如：MIIBIjANBg... -->";
        AlipayConfig alipayConfig = new AlipayConfig();
        alipayConfig.setServerUrl(appConfig.getPayAlipayPayDomain());
        alipayConfig.setAppId(appConfig.getPayAlipayAppId());
        alipayConfig.setPrivateKey(privateKey);
        alipayConfig.setFormat(FORMAT);
        alipayConfig.setAlipayPublicKey(alipayPublicKey);
        alipayConfig.setCharset(CHARSET);
        alipayConfig.setSignType(SIGN_TYPE);
        return alipayConfig;
    }

    @Override
    public PayOrderNotifyDto checkPayNotify(Map<String, Object> params, String jsonBody) throws AlipayApiException {
        log.info("支付宝支付回调,params:{}", params);
        log.info("jsonBody:{}", jsonBody);
        String sign = (String) params.get("sign");

        Map<String, String> stringMap = new HashMap<>();
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value == null) {
                stringMap.put(key, null);
            } else {
                stringMap.put(key, value.toString());
            }
        }

        String content = AlipaySignature.getSignCheckContentV1(stringMap);
        boolean checkSignature = AlipaySignature.rsa256CheckContent(content, sign, appConfig.getPayAlipayAlipayPublicKey(), "UTF-8"); // 验证签名
        // 支付宝验签
        if (checkSignature) {
            // 验签通过
            System.out.println("交易名称: " + params.get("subject"));
            System.out.println("交易状态: " + params.get("trade_status"));
            System.out.println("支付宝交易凭证号: " + params.get("trade_no"));
            System.out.println("商户订单号: " + params.get("out_trade_no"));
            System.out.println("交易金额: " + params.get("total_amount"));
            System.out.println("买家在支付宝唯一id: " + params.get("buyer_id"));
            System.out.println("买家付款时间: " + params.get("gmt_payment"));
            System.out.println("买家付款金额: " + params.get("buyer_pay_amount"));
        }

        PayOrderNotifyDto payOrderNotifyDto = new PayOrderNotifyDto();
        payOrderNotifyDto.setOrderId((String) params.get("out_trade_no"));
        payOrderNotifyDto.setChannelOrderId((String) params.get("trade_no"));
        return payOrderNotifyDto;
    }
}