package com.yymusic.service.impl;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;

import com.alipay.api.AlipayApiException;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.PayInfoDto;
import com.yymusic.entity.dto.PayOrderNotifyDto;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.*;
import com.yymusic.entity.po.PayCodeInfo;
import com.yymusic.entity.po.ProductInfo;
import com.yymusic.entity.po.UserInfo;
import com.yymusic.entity.query.PayCodeInfoQuery;
import com.yymusic.entity.query.ProductInfoQuery;
import com.yymusic.exception.BusinessException;
import com.yymusic.mappers.PayCodeInfoMapper;
import com.yymusic.mappers.ProductInfoMapper;
import com.yymusic.redis.RedisComponent;
import com.yymusic.api.PayChannelService;
import com.yymusic.service.UserInfoService;
import com.yymusic.service.UserIntegralRecordService;
import com.yymusic.spring.SpringContext;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.annotation.Resource;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.yymusic.entity.query.PayOrderInfoQuery;
import com.yymusic.entity.po.PayOrderInfo;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.mappers.PayOrderInfoMapper;
import com.yymusic.service.PayOrderInfoService;
import com.yymusic.utils.StringTools;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.concurrent.Future;


/**
 * 支付订单信息 业务接口实现
 */
@Service("payOrderInfoService")
@Slf4j
public class PayOrderInfoServiceImpl implements PayOrderInfoService {

    @Resource
    private PayOrderInfoMapper<PayOrderInfo, PayOrderInfoQuery> payOrderInfoMapper;

    @Resource
    private ProductInfoMapper<ProductInfo, ProductInfoQuery> productInfoMapper;

    @Resource
    private UserIntegralRecordService userIntegralRecordService;

    @Resource
    private RedisComponent redisComponent;
    @Resource
    private AppConfig appConfig;

    @Resource
    private PayCodeInfoMapper<PayCodeInfo, PayCodeInfoQuery> payCodeInfoMapper;
    @Resource
    private UserInfoService userInfoService;

    @Resource
    private SpringContext springContext;

    @Resource
    private PayOrderInfoService payOrderInfoServiceProxy;

    @Resource
    @Qualifier("backgroundTaskExecutor")
    private ExecutorService backgroundTaskExecutor;

    // 线程运行标记，原子类保证线程安全
    private final AtomicBoolean running = new AtomicBoolean(true);
    // 保存后台任务引用，用于终止
    private Future<?> delayOrderFuture;
    private Future<?> loopCheckPayFuture;

    /**
     * 根据条件查询列表
     */
    @Override
    public List<PayOrderInfo> findListByParam(PayOrderInfoQuery param) {
        return this.payOrderInfoMapper.selectList(param);
    }

    /**
     * 根据条件查询列表
     */
    @Override
    public Integer findCountByParam(PayOrderInfoQuery param) {
        return this.payOrderInfoMapper.selectCount(param);
    }

    /**
     * 分页查询方法
     */
    @Override
    public PaginationResultVO<PayOrderInfo> findListByPage(PayOrderInfoQuery param) {
        int count = this.findCountByParam(param);
        int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

        SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
        param.setSimplePage(page);
        List<PayOrderInfo> list = this.findListByParam(param);
        PaginationResultVO<PayOrderInfo> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
        return result;
    }

    /**
     * 新增
     */
    @Override
    public Integer add(PayOrderInfo bean) {
        return this.payOrderInfoMapper.insert(bean);
    }

    /**
     * 批量新增
     */
    @Override
    public Integer addBatch(List<PayOrderInfo> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.payOrderInfoMapper.insertBatch(listBean);
    }

    /**
     * 批量新增或者修改
     */
    @Override
    public Integer addOrUpdateBatch(List<PayOrderInfo> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.payOrderInfoMapper.insertOrUpdateBatch(listBean);
    }

    /**
     * 多条件更新
     */
    @Override
    public Integer updateByParam(PayOrderInfo bean, PayOrderInfoQuery param) {
        StringTools.checkParam(param);
        return this.payOrderInfoMapper.updateByParam(bean, param);
    }

    /**
     * 多条件删除
     */
    @Override
    public Integer deleteByParam(PayOrderInfoQuery param) {
        StringTools.checkParam(param);
        return this.payOrderInfoMapper.deleteByParam(param);
    }

    /**
     * 根据OrderId获取对象
     */
    @Override
    public PayOrderInfo getPayOrderInfoByOrderId(String orderId) {
        return this.payOrderInfoMapper.selectByOrderId(orderId);
    }

    /**
     * 根据OrderId修改
     */
    @Override
    public Integer updatePayOrderInfoByOrderId(PayOrderInfo bean, String orderId) {
        return this.payOrderInfoMapper.updateByOrderId(bean, orderId);
    }

    /**
     * 根据OrderId删除
     */
    @Override
    public Integer deletePayOrderInfoByOrderId(String orderId) {
        return this.payOrderInfoMapper.deleteByOrderId(orderId);
    }

    /*
     * 微信支付
     * */
    @Override
    public PayInfoDto getPayInfo(TokenUserInfoDto tokenUserInfoDto, String productId, Integer payType) {
        // 根据productId判断商品是否存在
        ProductInfo productInfo = productInfoMapper.selectByProductId(productId);
        if (productInfo == null || ProductOnSaleTypeEnum.NOT_ON_SALE.getCode().equals(productInfo.getOnsaleType())) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        // 根据payType判断是支付方式是否存在
        PayOrderTypeEnum payOrderTypeEnum = PayOrderTypeEnum.getByType(payType);
        if (payOrderTypeEnum == null || payOrderTypeEnum == PayOrderTypeEnum.PAY_CODE) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        String orderId = StringTools.getOrderId();
        String beanName = payOrderTypeEnum.getBeanName();
        // 根据beanName获取支付渠道服务(微信还是支付宝还是其他)
        PayChannelService payChannelService = (PayChannelService) springContext.getBean(beanName);
        // 调用对应支付渠道的支付接口
        String payUrl = payChannelService.getPayUrl(orderId, productInfo.getPrice(), productInfo.getProductName());

        PayOrderInfo payOrderInfo = new PayOrderInfo();
        payOrderInfo.setOrderId(orderId);
        payOrderInfo.setPayType(payType);
        payOrderInfo.setProductId(productId);
        payOrderInfo.setProductName(productInfo.getProductName());
        payOrderInfo.setAmount(productInfo.getPrice());
        payOrderInfo.setUserId(tokenUserInfoDto.getUserId());
        payOrderInfo.setIntegral(productInfo.getIntegral());
        payOrderInfo.setStatus(PayOrderStatusEnum.NO_PAY.getStatus());
        payOrderInfo.setCreateTime(new Date());
        payOrderInfo.setPayInfo(PayOrderTypeEnum.PAY_ALIPAY == payOrderTypeEnum ? null : payUrl);
        this.add(payOrderInfo);

        // 将订单放入延迟队列
        redisComponent.addOrder2DelayQueue(Constants.ORDER_TIMEOUT_MIN + 1, orderId);

        PayInfoDto payInfoDto = new PayInfoDto();
        payInfoDto.setOrderId(orderId);
        payInfoDto.setPayUrl(payUrl);
        return payInfoDto;
    }

    @Override
    public void payNotify(Integer payType, Map<String, Object> params, String body) throws AlipayApiException {
        PayOrderTypeEnum payOrderTypeEnum = PayOrderTypeEnum.getByType(payType);
        String beanName = payOrderTypeEnum.getBeanName();
        // 根据beanName获取支付渠道服务(微信还是支付宝还是其他)
        PayChannelService payChannelService = (PayChannelService) springContext.getBean(beanName);
        // 回调验签,并返回支付订单信息
        PayOrderNotifyDto payOrderNotifyDto = payChannelService.checkPayNotify(params, body);
        PayOrderInfo payOrderInfo = this.payOrderInfoMapper.selectByOrderId(payOrderNotifyDto.getOrderId());
        if (payOrderInfo == null) {
            throw new BusinessException("支付回调处理失败,支付回调订单" + payOrderNotifyDto.getOrderId() + "不存在");
        }
        payOrderInfoServiceProxy.processPayOrderSuccess(payOrderInfo, payOrderNotifyDto.getChannelOrderId());
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void processPayOrderSuccess(PayOrderInfo payOrderInfo, String channelOrderId) {
        payOrderSuccess(payOrderInfo, channelOrderId);
    }

    /*
     * 使用场景: 没有微信回调场景
     * 在配置文件配上 auto.checkpay=true 才会执行
     * 轮询检查待支付的订单,向微信发送请求查询订单状态并更新订单状态
     * */
    @PostConstruct
    public void checkPayOrder() {
        if (!appConfig.getAutoCheckPay()) {
            return;
        }
        loopCheckPayFuture = backgroundTaskExecutor.submit(() -> {
            while (running.get() && !Thread.currentThread().isInterrupted()) {
                try {
                    PayOrderInfoQuery payOrderInfoQuery = new PayOrderInfoQuery();
                    payOrderInfoQuery.setStatus(PayOrderStatusEnum.NO_PAY.getStatus());
                    List<PayOrderInfo> payOrderInfos = this.payOrderInfoMapper.selectList(payOrderInfoQuery);
                    for (PayOrderInfo payOrderInfo : payOrderInfos) {
                        String beanName = PayOrderTypeEnum.getByType(payOrderInfo.getPayType()).getBeanName();
                        // 根据beanName获取支付渠道服务(微信还是支付宝还是其他)
                        PayChannelService payChannelService = (PayChannelService) springContext.getBean(beanName);
                        // 调用对应支付渠道的支付通知接口
                        PayOrderNotifyDto payOrderNotifyDto = payChannelService.queryOrder(payOrderInfo.getOrderId());
                        if (payOrderNotifyDto == null) {
                            continue;
                        }
                        payOrderInfoServiceProxy.processPayOrderSuccess(payOrderInfo, payOrderNotifyDto.getChannelOrderId());
                    }
                    Thread.sleep(10000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.info("Loop check pay task interrupted, exiting");
                    break;
                } catch (Exception e) {
                    log.error("轮询检查待支付的订单,向支付渠道发送请求查询订单状态并更新订单状态失败", e);
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        log.info("Loop check pay task interrupted during sleep, exiting");
                        break;
                    }
                }
            }
        });
    }

    private void payOrderSuccess(PayOrderInfo payOrderInfo, String channelOrderId) {
        if (PayOrderStatusEnum.HAVE_PAY.getStatus().equals(payOrderInfo.getStatus())) {
            return;
        }
        // 设置orderId的订单状态为已支付
        PayOrderInfo updateInfo = new PayOrderInfo();
        updateInfo.setStatus(PayOrderStatusEnum.HAVE_PAY.getStatus());
        updateInfo.setPayTime(new Date());
        updateInfo.setChannelOrderId(channelOrderId);
        // 根据NO_PAY条件查询, 保证只有一个线程能更新成功
        PayOrderInfoQuery query = new PayOrderInfoQuery();
        query.setOrderId(payOrderInfo.getOrderId());
        query.setStatus(PayOrderStatusEnum.NO_PAY.getStatus());
        Integer updateCount = this.payOrderInfoMapper.updateByParam(updateInfo, query);
        // 拦截更新不成功的订单
        if (updateCount == 0) {
            if(payOrderInfo.getStatus().equals(PayOrderStatusEnum.HAVE_PAY.getStatus())) {
                return;
            }
            throw new BusinessException("支付回调处理失败,支付回调订单" + payOrderInfo.getOrderId() + "状态异常");
        }
        // 更新用户积分
        userIntegralRecordService.changeUserIntegral(UserIntegralRecordTypeEnum.RECHARGE, payOrderInfo.getOrderId(), payOrderInfo.getUserId(), payOrderInfo.getIntegral(), payOrderInfo.getAmount());
        redisComponent.cacheHavePayOrder(payOrderInfo.getOrderId());
    }

    /*
     * 从延时队列中获取订单(超时订单)
     * 二维码订单超时后设置数据库状态为超时
     * */
    @PostConstruct
    public void consumeDelayOrder() {
        delayOrderFuture = backgroundTaskExecutor.submit(() -> {
            while (running.get() && !Thread.currentThread().isInterrupted()) { // 用原子布尔值控制循环
                try {
                    Set<String> queueOrderList = redisComponent.getTimeOutOrder();
                    if (CollectionUtils.isEmpty(queueOrderList)) {
                        Thread.sleep(10000);
                        continue;
                    }
                    for (String orderId : queueOrderList) {
                        if (!running.get()) break; // 检测到停止信号，立即退出循环
                        if (redisComponent.removeTimeOutOrder(orderId) > 0) {
                            log.debug("订单" + orderId + "已超时");
                            PayOrderInfo payOrderInfo = this.payOrderInfoMapper.selectByOrderId(orderId);
                            if (payOrderInfo == null) {
                                continue;
                            }
                            PayOrderInfo updateInfo = new PayOrderInfo();
                            updateInfo.setStatus(PayOrderStatusEnum.TIME_OUT.getStatus());
                            PayOrderInfoQuery query = new PayOrderInfoQuery();
                            query.setOrderId(orderId);
                            query.setStatus(PayOrderStatusEnum.NO_PAY.getStatus());
                            this.payOrderInfoMapper.updateByParam(updateInfo, query);
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("延迟订单处理线程被中断，准备退出");
                    break;
                } catch (Exception e) {
                    log.error("轮询检查待支付的订单失败", e);
                    try {
                        Thread.sleep(10000);
                    } catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        log.error("休眠失败", ex);
                        break;
                    }
                }
            }
        });
    }

    // Spring容器销毁时执行，终止后台线程
    @PreDestroy
    public void stopConsumeDelayOrder() {
        running.set(false); // 置为false，终止循环
        if (loopCheckPayFuture != null) {
            loopCheckPayFuture.cancel(true);
        }
        if (delayOrderFuture != null) {
            delayOrderFuture.cancel(true);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void buyByPayCode(String productId, String payCode, String userId) {
        PayCodeInfo payCodeInfo = payCodeInfoMapper.selectByPayCode(payCode);
        if (payCodeInfo == null) {
            throw new BusinessException("支付码不正确");
        }
        if (PayCodeStatusEnum.USED.getCode().equals(payCodeInfo.getStatus())) {
            throw new BusinessException("支付码不正确");
        }
        if (System.currentTimeMillis() - payCodeInfo.getCreateTime().getTime() > appConfig.getPayCodeExpireTimeMinute() * 60 * 1000) {
            throw new BusinessException("支付码已过期");
        }
        ProductInfo productInfo = this.productInfoMapper.selectByProductId(productId);
        if (productInfo == null || ProductOnSaleTypeEnum.NOT_ON_SALE.getCode().equals(productInfo.getOnsaleType())) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        if (productInfo.getPrice().compareTo(payCodeInfo.getAmount()) != 0) {
            throw new BusinessException("不是此商品的支付吗");
        }
        Date curDate = new Date();
        // 新增支付订单
        PayOrderInfo payOrderInfo = new PayOrderInfo();
        payOrderInfo.setOrderId(StringTools.getOrderId());
        payOrderInfo.setUserId(userId);
        payOrderInfo.setProductId(productId);
        payOrderInfo.setProductName(productInfo.getProductName());
        payOrderInfo.setAmount(payCodeInfo.getAmount());
        payOrderInfo.setStatus(PayOrderStatusEnum.HAVE_PAY.getStatus());
        payOrderInfo.setPayTime(curDate);
        payOrderInfo.setPayType(PayOrderTypeEnum.PAY_CODE.getType());
        payOrderInfo.setIntegral(productInfo.getIntegral());
        payOrderInfo.setCreateTime(curDate);
        this.payOrderInfoMapper.insert(payOrderInfo);
        // 更新支付码状态
        PayCodeInfo updatePayCodeInfo = new PayCodeInfo();
        updatePayCodeInfo.setStatus(PayCodeStatusEnum.USED.getCode());
        updatePayCodeInfo.setUseUserId(userId);
        updatePayCodeInfo.setUseTime(curDate);

        PayCodeInfoQuery query = new PayCodeInfoQuery();
        query.setPayCode(payCode);
        query.setStatus(PayCodeStatusEnum.NO_USE.getCode());
        Integer updateCount = this.payCodeInfoMapper.updateByParam(updatePayCodeInfo, query);

        if (updateCount == 0) {
            throw new BusinessException("支付码支付失败");
        }

        userIntegralRecordService.changeUserIntegral(UserIntegralRecordTypeEnum.RECHARGE, payOrderInfo.getOrderId(), userId, productInfo.getIntegral(), payCodeInfo.getAmount());
    }

    @Override
    public Integer checkHavePay(String orderId, String userId) {
        PayOrderInfo payOrderInfo = payOrderInfoMapper.selectByOrderId(orderId);
        if (payOrderInfo == null || PayOrderStatusEnum.NO_PAY.getStatus().equals(payOrderInfo.getStatus())) {
            return null;
        }
        UserInfo userInfo = userInfoService.getUserInfoByUserId(userId);
        return userInfo.getIntegral();
    }
}
