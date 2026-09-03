package com.yymusic.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.yymusic.entity.constants.Constants;
import com.yymusic.utils.FileUtils;
import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import com.yymusic.entity.enums.PageSize;
import com.yymusic.entity.query.ProductInfoQuery;
import com.yymusic.entity.po.ProductInfo;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.mappers.ProductInfoMapper;
import com.yymusic.service.ProductInfoService;
import com.yymusic.utils.StringTools;
import org.springframework.web.multipart.MultipartFile;


/**
 * 商品信息 业务接口实现
 */
@Service("productInfoService")
public class ProductInfoServiceImpl implements ProductInfoService {

	@Resource
	private ProductInfoMapper<ProductInfo, ProductInfoQuery> productInfoMapper;

	@Resource
	private FileUtils fileUtils;

	/**
	 * 根据条件查询列表
	 */
	@Override
	public List<ProductInfo> findListByParam(ProductInfoQuery param) {
		return this.productInfoMapper.selectList(param);
	}

	/**
	 * 根据条件查询列表
	 */
	@Override
	public Integer findCountByParam(ProductInfoQuery param) {
		return this.productInfoMapper.selectCount(param);
	}

	/**
	 * 分页查询方法
	 */
	@Override
	public PaginationResultVO<ProductInfo> findListByPage(ProductInfoQuery param) {
		int count = this.findCountByParam(param);
		int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

		SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
		param.setSimplePage(page);
		List<ProductInfo> list = this.findListByParam(param);
		PaginationResultVO<ProductInfo> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
		return result;
	}

	/**
	 * 新增
	 */
	@Override
	public Integer add(ProductInfo bean) {
		return this.productInfoMapper.insert(bean);
	}

	/**
	 * 批量新增
	 */
	@Override
	public Integer addBatch(List<ProductInfo> listBean) {
		if (listBean == null || listBean.isEmpty()) {
			return 0;
		}
		return this.productInfoMapper.insertBatch(listBean);
	}

	/**
	 * 批量新增或者修改
	 */
	@Override
	public Integer addOrUpdateBatch(List<ProductInfo> listBean) {
		if (listBean == null || listBean.isEmpty()) {
			return 0;
		}
		return this.productInfoMapper.insertOrUpdateBatch(listBean);
	}

	/**
	 * 多条件更新
	 */
	@Override
	public Integer updateByParam(ProductInfo bean, ProductInfoQuery param) {
		StringTools.checkParam(param);
		return this.productInfoMapper.updateByParam(bean, param);
	}

	/**
	 * 多条件删除
	 */
	@Override
	public Integer deleteByParam(ProductInfoQuery param) {
		StringTools.checkParam(param);
		return this.productInfoMapper.deleteByParam(param);
	}

	/**
	 * 根据ProductId获取对象
	 */
	@Override
	public ProductInfo getProductInfoByProductId(String productId) {
		return this.productInfoMapper.selectByProductId(productId);
	}

	/**
	 * 根据ProductId修改
	 */
	@Override
	public Integer updateProductInfoByProductId(ProductInfo bean, String productId) {
		return this.productInfoMapper.updateByProductId(bean, productId);
	}

	/**
	 * 根据ProductId删除
	 */
	@Override
	public Integer deleteProductInfoByProductId(String productId) {
		return this.productInfoMapper.deleteByProductId(productId);
	}

	@Override
	public void saveProduct(ProductInfo productInfo, MultipartFile coverFile) {
		String productId = productInfo.getProductId() == null ? StringTools.getRandomNumber(Constants.LENGTH_5) : productInfo.getProductId();
		if(coverFile != null && !coverFile.isEmpty()){
			// 上传文件
			String coverUrl = fileUtils.uploadFile(coverFile, Constants.PRODUCT_FOLDER_NAME, productId + Constants.DEFAULT_IMAGE_SUFFIX);
			productInfo.setCover(coverUrl);
		}
		if(StringTools.isEmpty(productInfo.getProductId())) {
			// 新增
			productInfo.setSort(0);
			productInfo.setCreateTime(new Date());
			productInfo.setProductId(productId);
			this.productInfoMapper.insert(productInfo);
		} else {
			// 更新
			this.productInfoMapper.updateByProductId(productInfo, productInfo.getProductId());
		}
	}

	@Override
	public void changeProductSort(String productIds) {
		String[] productIdArray = productIds.split(",");
		List<ProductInfo> productInfoList = new ArrayList<>();
		for(int i = 0; i < productIdArray.length; i++){
			ProductInfo productInfo = new ProductInfo();
			productInfo.setProductId(productIdArray[i]);
			productInfo.setSort(i);
			productInfoList.add(productInfo);
		}
		this.productInfoMapper.changeSort(productInfoList);
	}
}