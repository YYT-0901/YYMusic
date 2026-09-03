package com.yymusic.controller;

import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.po.ProductInfo;
import com.yymusic.entity.query.ProductInfoQuery;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.ProductInfoService;
import com.yymusic.utils.FileUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 商品信息 Controller
 */
@RestController
@RequestMapping("/product")
@Slf4j
@Validated
@Tag(name = "商品相关接口")
public class ProductInfoController extends ABaseController {

    @Resource
    private ProductInfoService productInfoService;

    @Resource
    private FileUtils fileUtils;

    @Operation(summary = "获取商品列表", description = "返回所有商品列表")
    @RequestMapping("/loadProduct")
    public ResponseVO loadProduct() {
        ProductInfoQuery productInfoQuery = new ProductInfoQuery();
        productInfoQuery.setOrderBy("p.sort asc");
        List<ProductInfo> list = productInfoService.findListByParam(productInfoQuery);
        return getSuccessResponseVO(list);
    }

    @Operation(summary = "保存商品", description = "保存商品信息和封面图片")
    @RequestMapping("/saveProduct")
    public ResponseVO saveProduct(MultipartFile coverFile, ProductInfo productInfo) {
        productInfoService.saveProduct(productInfo, coverFile);
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "改变商品排序", description = "根据商品ID列表改变商品排序")
    @RequestMapping("/changeProductSort")
    public ResponseVO changeProductSort(@NotEmpty String productIds) {
        productInfoService.changeProductSort(productIds);
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "删除商品", description = "根据商品ID删除商品和封面图片")
    @RequestMapping("/delProduct")
    public ResponseVO delProduct(@NotEmpty String productId) {
        fileUtils.deleteFile(Constants.PRODUCT_FOLDER_NAME + productId + Constants.DEFAULT_IMAGE_SUFFIX);
        productInfoService.deleteProductInfoByProductId(productId);
        return getSuccessResponseVO(null);
    }
}