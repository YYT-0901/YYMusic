package com.yymusic.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.yymusic.entity.FileInfo;
import com.yymusic.service.FileService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@ConditionalOnProperty(value = "oss.type", havingValue = "local")
@ConfigurationProperties(prefix = "oss.local")
@RequiredArgsConstructor
@Data
@Slf4j
public class LocalFileServiceImpl implements FileService {

    private String storagePath;
    private String domain;

    @Override
    public FileInfo uploadFile(MultipartFile file, String folderName, String fileName) {
        String originalFilename = file.getOriginalFilename();
        String suffix = FileUtil.getSuffix(originalFilename);
        folderName = StrUtil.nullToEmpty(folderName);
        if (StrUtil.isEmpty(folderName)) {
            folderName = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        } else {
            folderName = folderName.replaceAll("/+$", "");
        }
        if (StrUtil.isEmpty(fileName)) {
            fileName = IdUtil.simpleUUID() + "." + suffix;
        }

        String folderPath = storagePath + File.separator + folderName;
        File folder = new File(folderPath);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String filePath = folderPath + File.separator + fileName;
        try {
            file.transferTo(new File(filePath));
        } catch (Exception e) {
            log.error("上传文件失败", e);
            throw new RuntimeException("上传文件失败: " + e.getMessage());
        }

        String fileUrl = domain + "/" + folderName + "/" + fileName;
        FileInfo fileInfo = new FileInfo();
        fileInfo.setName(originalFilename);
        fileInfo.setUrl(fileUrl);
        return fileInfo;
    }

    @Override
    public FileInfo uploadFile(InputStream inputStream, String folderName, String fileName, String originalFilename, String contentType) {
        folderName = StrUtil.nullToEmpty(folderName);
        if (StrUtil.isEmpty(folderName)) {
            folderName = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        } else {
            folderName = folderName.replaceAll("/+$", "");
        }

        String folderPath = storagePath + File.separator + folderName;
        File folder = new File(folderPath);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String filePath = folderPath + File.separator + fileName;
        try (FileOutputStream outputStream = new FileOutputStream(filePath)) {
            byte[] bytes = new byte[8192];
            int length;
            while ((length = inputStream.read(bytes)) != -1) {
                outputStream.write(bytes, 0, length);
            }
            outputStream.flush();
        } catch (Exception e) {
            log.error("上传文件失败", e);
            throw new RuntimeException("上传文件失败: " + e.getMessage());
        }

        String fileUrl = domain + "/" + folderName + "/" + fileName;
        FileInfo fileInfo = new FileInfo();
        fileInfo.setName(originalFilename);
        fileInfo.setUrl(fileUrl);
        return fileInfo;
    }

    @Override
    public FileInfo downloadFile(URL url, String folderName, String fileName, String suffix) {
        try (InputStream inputStream = url.openStream()) {
            String originalFileName = fileName + suffix;
            return uploadFile(inputStream, folderName, fileName + suffix, originalFileName, "application/octet-stream");
        } catch (Exception e) {
            log.error("下载文件失败", e);
            throw new RuntimeException("下载文件失败: " + e.getMessage());
        }
    }

    @Override
    public boolean deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }

        String relativePath = filePath.replace(domain + "/", "");
        String fullPath = storagePath + File.separator + relativePath;
        File file = new File(fullPath);

        if (!file.exists()) {
            log.warn("文件不存在: {}", fullPath);
            return false;
        }

        boolean deleted = file.delete();
        if (!deleted) {
            log.error("删除文件失败: {}", fullPath);
        }
        return deleted;
    }
}
