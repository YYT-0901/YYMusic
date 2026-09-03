package com.yymusic.controller;

import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.constants.Constants;
import com.yymusic.utils.StringTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.io.*;
import java.util.Date;

@Slf4j
@RestController
@RequestMapping("/file")
@Validated
@Tag(name = "文件接口", description = "读取文件信息")
public class FileController {
    @Resource
    private AppConfig appConfig;

    @Operation(summary = "获取文件资源", description = "根据文件路径获取文件资源,支持范围请求")
    @RequestMapping("/getResource")
    public void getResource(HttpServletResponse response, @RequestHeader(name = "range", required = false) String rangeHeader, @NotEmpty String filePath) {
        if (!StringTools.pathIsOK(filePath)) {
            return;
        }
        filePath = appConfig.getProjectFolder() + Constants.FILE_FOLDER_FILE + filePath;
        String suffix = StringTools.getFileSuffix(filePath);
        if (!StringTools.isEmpty(suffix) && ArrayUtils.contains(Constants.IMAGE_SUFFIX, suffix.toLowerCase())) {
            // 图片类型设置缓存时间为30天
            response.setHeader("Cache-Control", "max-age=2592000");
            response.setContentType("image/jpg");
        }
        readFile(response, rangeHeader, filePath);
    }

    private void readFile(HttpServletResponse response, String rangeHeader, String filePath) {
        File file = new File(filePath);

        if (!file.exists() || !file.isFile() || !file.canRead()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        try (RandomAccessFile randomAccessFile = new RandomAccessFile(file, "r"); OutputStream out = response.getOutputStream()) {
            long fileSize = randomAccessFile.length();
            long start = 0;
            long end = fileSize - 1;
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String[] range = rangeHeader.substring("bytes=".length()).split("-");
                start = Long.parseLong(range[0]);
                if (range.length > 1 && !range[1].isEmpty()) {
                    end = Long.parseLong(range[1]);
                }
                if (end > fileSize - 1 || end < start || start < 0) {
                    response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
                    response.setHeader("Content-Range", "bytes */" + fileSize);
                    return;
                }
            }
            long contentLength = end - start + 1;
            response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Last-Modified", new Date(file.lastModified()).toString());
            if (rangeHeader != null) {
                response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
                response.setHeader("Content-Range", "bytes " + start + "-" + end + "/" + fileSize);
            }
            response.setHeader("Content-Length", String.valueOf(contentLength));
            randomAccessFile.seek(start);
            byte[] bytes = new byte[1024];
            long remaining = contentLength;

            while (remaining > 0) {
                int len = (int) Math.min(remaining, bytes.length);
                int read = randomAccessFile.read(bytes, 0, len);
                if (read == -1) {
                    break;
                }
                out.write(bytes, 0, read);
                remaining -= read;
            }
            out.flush();
        } catch (
                AsyncRequestNotUsableException ignored) {
        } catch (
                Exception e) {
            log.error("读取文异常", e);
        }
    }
}
