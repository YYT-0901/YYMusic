package com.yymusic.mappers;

import com.yymusic.entity.dto.PayCodeInfoWithUserDto;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 支付码 数据库操作接口
 */
public interface PayCodeInfoMapper<T,P> extends BaseMapper<T,P> {

	/**
	 * 根据PayCode更新
	 */
	 Integer updateByPayCode(@Param("bean") T t,@Param("payCode") String payCode);


	/**
	 * 根据PayCode删除
	 */
	 Integer deleteByPayCode(@Param("payCode") String payCode);


	/**
	 * 根据PayCode获取对象
	 */
	 T selectByPayCode(@Param("payCode") String payCode);


	List<PayCodeInfoWithUserDto> selectListWithUser(@Param("query") P payCodeInfoQuery);
}
