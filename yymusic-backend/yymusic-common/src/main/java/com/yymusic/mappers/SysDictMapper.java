package com.yymusic.mappers;

import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 系统字典 数据库操作接口
 */
public interface SysDictMapper<T,P> extends BaseMapper<T,P> {

	/**
	 * 根据DictId更新
	 */
	 Integer updateByDictId(@Param("bean") T t,@Param("dictId") Integer dictId);


	/**
	 * 根据DictId删除
	 */
	 Integer deleteByDictId(@Param("dictId") Integer dictId);


	/**
	 * 根据DictId获取对象
	 */
	 T selectByDictId(@Param("dictId") Integer dictId);


	void changeSort(@Param("list") List<T> sysDictList);
}
