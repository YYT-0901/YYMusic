package com.yymusic.controller;

import com.yymusic.entity.query.PayOrderInfoQuery;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.PayOrderInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/order")
@Slf4j
@Tag(name = "订单管理接口")
public class PayOrderController extends ABaseController {

    @Resource
    private PayOrderInfoService payOrderInfoService;

    @Operation(summary = "加载订单列表")
    @RequestMapping("/loadOrder")
    public ResponseVO loadOrder(PayOrderInfoQuery orderInfoQuery) {
        orderInfoQuery.setOrderBy("p.create_time desc");
        orderInfoQuery.setQueryUser(true);
        PaginationResultVO resultVO = payOrderInfoService.findListByPage(orderInfoQuery);
        return getSuccessResponseVO(resultVO);
    }
}
