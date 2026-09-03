package com.yymusic.controller;

import com.yymusic.entity.po.SysDict;
import com.yymusic.entity.query.SysDictQuery;
import com.yymusic.entity.vo.ResponseVO;
import com.yymusic.service.SysDictService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商品信息 Controller
 */
@RestController
@RequestMapping("/settings")
@Slf4j
@Validated
@Tag(name = "系统字典")
public class SysDictController extends ABaseController {

    @Resource
    private SysDictService sysDictService;

    @Operation(summary = "加载系统字典列表", description = "")
    @RequestMapping("/loadSysDictList")
    public ResponseVO loadSysDictList(SysDictQuery sysDictQuery) {
        sysDictQuery.setOrderBy("sort asc");
        return getSuccessResponseVO(sysDictService.findListByPage(sysDictQuery));
    }

    @Operation(summary = "保存系统字典", description = "新增/修改")
    @RequestMapping("/saveSysDict")
    public ResponseVO saveSysDict(SysDict sysDict) {
        sysDictService.saveSysDict(sysDict);
        return getSuccessResponseVO(null);
    }

    @Operation(summary = "修改系统字典排序", description = "")
    @RequestMapping("/changeSort")
    public ResponseVO changeSort(@NotEmpty String dictPcode, @NotEmpty String dictIds) {
        sysDictService.changeSort(dictPcode, dictIds);
        return getSuccessResponseVO(null);
    }


    @Operation(summary = "删除系统字典", description = "")
    @RequestMapping("/delSysDict")
    public ResponseVO delSysDict(@NotNull Integer dictId) {
        sysDictService.delSysDictByDictId(dictId);
        return getSuccessResponseVO(null);
    }
}