package com.yymusic.service;

import java.util.List;
import java.util.Map;

import com.yymusic.entity.query.SysDictQuery;
import com.yymusic.entity.po.SysDict;
import com.yymusic.entity.vo.PaginationResultVO;


/**
 * 系统字典 业务接口
 */
public interface SysDictService {

	/**
	 * 根据条件查询列表
	 */
	List<SysDict> findListByParam(SysDictQuery param);

	/**
	 * 根据条件查询列表
	 */
	Integer findCountByParam(SysDictQuery param);

	/**
	 * 分页查询
	 */
	PaginationResultVO<SysDict> findListByPage(SysDictQuery param);

	/**
	 * 新增
	 */
	Integer add(SysDict bean);

	/**
	 * 批量新增
	 */
	Integer addBatch(List<SysDict> listBean);

	/**
	 * 批量新增/修改
	 */
	Integer addOrUpdateBatch(List<SysDict> listBean);

	/**
	 * 多条件更新
	 */
	Integer updateByParam(SysDict bean,SysDictQuery param);

	/**
	 * 多条件删除
	 */
	Integer deleteByParam(SysDictQuery param);

	/**
	 * 根据DictId查询对象
	 */
	SysDict getSysDictByDictId(Integer dictId);


	/**
	 * 根据DictId修改
	 */
	Integer updateSysDictByDictId(SysDict bean,Integer dictId);


	/**
	 * 根据DictId删除
	 */
	Integer deleteSysDictByDictId(Integer dictId);

	void saveSysDict(SysDict sysDict);

	void changeSort(String dictPcode, String dictIds);

	void delSysDictByDictId(Integer dictId);

	Map<String, List<SysDict>> getDictFromCache();
}