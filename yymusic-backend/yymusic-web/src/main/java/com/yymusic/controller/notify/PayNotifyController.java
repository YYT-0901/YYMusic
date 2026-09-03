package com.yymusic.controller.notify;

import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.enums.PayOrderTypeEnum;
import com.yymusic.service.PayOrderInfoService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RequestMapping("/payNotify")
@Slf4j
@RestController
public class PayNotifyController {

    @Resource
    private PayOrderInfoService payOrderInfoService;
    @Resource
    private AppConfig appConfig;

    @RequestMapping("/payNotify4Wechat")
    public ResponseEntity payNotify4Wechat(@PathVariable Integer payType,
                                           @RequestBody String body,
                                           @RequestHeader(value = "Wechatpay-Timestamp", required = false) String wechatPayTimestamp,
                                           @RequestHeader(value = "Wechatpay-Nonce", required = false) String wechatPayNonce,
                                           @RequestHeader(value = "Wechatpay-Signature", required = false) String wechatPaySignature) {
        try {
            log.info("微信回调成功, payType: {}, body: {}, wechatPayTimestamp: {}, wechatPayNonce: {}, wechatPaySignature: {}",
                    payType, body, wechatPayTimestamp, wechatPayNonce, wechatPaySignature);
            Map<String, Object> param = new HashMap<>();
            param.put("wechatPayTimestamp", wechatPayTimestamp);
            param.put("wechatPayNonce", wechatPayNonce);
            param.put("wechatPaySignature", wechatPaySignature);
            payOrderInfoService.payNotify(payType, param, body);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            log.error("微信回调失败", e);
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping("/payNotify4Alipay")
    public ResponseEntity payNotify4Alipay(HttpServletRequest request) {
        try {
            if (request.getParameter("trade_status").equals("TRADE_SUCCESS")) {
                System.out.println("=========支付宝异步回调========");
                Map<String, Object> params = new HashMap<>();
                Map<String, String[]> requestParams = request.getParameterMap();
                for (String name : requestParams.keySet()) {
                    params.put(name, request.getParameter(name));
                    // System.out.println(name + " = " + request.getParameter(name));
                }
                payOrderInfoService.payNotify(PayOrderTypeEnum.PAY_ALIPAY.getType(), params, null);
                return new ResponseEntity(HttpStatus.OK);
            }
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("支付宝回调失败", e);
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
