package com.yymusic.utils;

import com.yymusic.entity.FileInfo;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.enums.DateTimePatternEnum;
import com.yymusic.service.FileService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;
import java.util.Date;

@Component
@Slf4j
public class FileUtils {

    @Resource
    private AppConfig appConfig;

    @Resource
    private FileService fileService;

    public String copyAvatar(String userId) {
        try {
            int randomNumber = (int) (Math.random() * 10) + 1;
            ClassPathResource resource = new ClassPathResource(String.format(Constants.DEFAULT_AVATAR_PATH, randomNumber));
            String fileName = userId + Constants.AVATAR_SUFFIX;
            String folderName = Constants.FILE_FOLDER_AVATAR.replace("/", "");
            
            try (InputStream inputStream = resource.getInputStream()) {
                FileInfo fileInfo = fileService.uploadFile(inputStream, folderName, fileName, fileName, "image/png");
                if (fileInfo != null) {
                    return fileInfo.getUrl();
                }
            }
            return null;
        } catch (Exception e) {
            log.error("复制默认头像失败", e);
            return null;
        }
    }

    public String uploadFile(MultipartFile file, String folderName, String fileName) {
        try {
            FileInfo fileInfo = fileService.uploadFile(file, folderName, fileName);
            if (fileInfo != null) {
                return fileInfo.getUrl();
            }
            return null;
        } catch (Exception e) {
            log.error("上传文件失败", e);
            return null;
        }
    }

    public void deleteFile(String filePath) {
        try {
            fileService.deleteFile(filePath);
        } catch (Exception e) {
            log.error("删除文件失败：{}", filePath, e);
        }
    }

    public String downloadFile(String url, String suffix) {
        try {
            String folderName = DateUtil.format(new Date(), DateTimePatternEnum.YYYYMM.getPattern());
            String fileName = StringTools.getRandomString(Constants.LENGTH_30);
            
            URL urlObj = new URL(url);
            FileInfo fileInfo = fileService.downloadFile(urlObj, folderName, fileName, suffix);
            if (fileInfo != null) {
                return fileInfo.getUrl();
            }
            return null;
        } catch (Exception e) {
            log.error("下载文件失败", e);
            return null;
        }
    }
}
