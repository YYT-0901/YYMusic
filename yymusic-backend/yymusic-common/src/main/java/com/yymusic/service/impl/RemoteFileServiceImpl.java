package com.yymusic.service.impl;

import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.yymusic.entity.FileInfo;
import com.yymusic.service.FileService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.time.LocalDateTime;

@Service
@ConditionalOnProperty(value = "oss.type", havingValue = "remote")
@ConfigurationProperties(prefix = "oss.remote")
@RequiredArgsConstructor
@Data
@Slf4j
public class RemoteFileServiceImpl implements FileService {

    private String ftpHost;
    private Integer ftpPort;
    private String ftpUsername;
    private String ftpPassword;
    private String storagePath;

    @Override
    public FileInfo uploadFile(MultipartFile file, String folderName, String fileName) {
        String originalFilename = file.getOriginalFilename();
        String suffix = FileUtil.getSuffix(originalFilename);
        folderName = StrUtil.nullToEmpty(folderName);
        if (StrUtil.isEmpty(folderName)) {
            folderName = DateUtil.format(LocalDateTime.now(), DatePattern.PURE_DATE_PATTERN);
        } else {
            folderName = folderName.replaceAll("/+$", "");
        }
        if (StrUtil.isEmpty(fileName)) {
            fileName = IdUtil.simpleUUID() + "." + suffix;
        }
        String remoteFilePath = storagePath + folderName + "/" + fileName;

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();

            createRemoteDirectory(ftpClient, storagePath + folderName);

            try (InputStream inputStream = file.getInputStream();
                 OutputStream outputStream = ftpClient.storeFileStream(remoteFilePath)) {
                byte[] bytes = new byte[8192];
                int length;
                while ((length = inputStream.read(bytes)) != -1) {
                    outputStream.write(bytes, 0, length);
                }
                outputStream.flush();
            }

            int replyCode = ftpClient.getReplyCode();
            if (replyCode == FTPReply.FILE_STATUS_OK || replyCode == FTPReply.CLOSING_DATA_CONNECTION || replyCode == 125) {
                String fileUrl = "http://" + ftpHost + "/yymusic/" + folderName + "/" + fileName;
                FileInfo fileInfo = new FileInfo();
                fileInfo.setName(originalFilename);
                fileInfo.setUrl(fileUrl);
                return fileInfo;
            } else {
                log.error("文件上传失败，FTP服务器响应码: {}", replyCode);
                throw new RuntimeException("文件上传失败");
            }
        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (Exception e) {
                log.error("关闭FTP连接失败", e);
            }
        }
    }

    @Override
    public FileInfo uploadFile(InputStream inputStream, String folderName, String fileName, String originalFilename, String contentType) {
        folderName = StrUtil.nullToEmpty(folderName);
        if (StrUtil.isEmpty(folderName)) {
            folderName = DateUtil.format(LocalDateTime.now(), DatePattern.PURE_DATE_PATTERN);
        } else {
            folderName = folderName.replaceAll("/+$", "");
        }
        
        String remoteFilePath = storagePath + folderName + "/" + fileName;

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();

            createRemoteDirectory(ftpClient, storagePath + folderName);

            try (OutputStream outputStream = ftpClient.storeFileStream(remoteFilePath)) {
                byte[] bytes = new byte[8192];
                int length;
                while ((length = inputStream.read(bytes)) != -1) {
                    outputStream.write(bytes, 0, length);
                }
                outputStream.flush();
            }

            int replyCode = ftpClient.getReplyCode();
            if (replyCode == FTPReply.FILE_STATUS_OK || replyCode == FTPReply.CLOSING_DATA_CONNECTION || replyCode == 125) {
                String fileUrl = "http://" + ftpHost + "/yymusic/" + folderName + "/" + fileName;
                FileInfo fileInfo = new FileInfo();
                fileInfo.setName(originalFilename);
                fileInfo.setUrl(fileUrl);
                return fileInfo;
            } else {
                log.error("文件上传失败，FTP服务器响应码: {}", replyCode);
                throw new RuntimeException("文件上传失败");
            }
        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (Exception e) {
                log.error("关闭FTP连接失败", e);
            }
        }
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

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(ftpHost, ftpPort);
            ftpClient.login(ftpUsername, ftpPassword);

            String remoteFilePath = filePath.replace("http://" + ftpHost + "/yymusic/", storagePath);
            boolean success = ftpClient.deleteFile(remoteFilePath);
            return success;
        } catch (Exception e) {
            log.error("文件删除失败", e);
            return false;
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (Exception e) {
                log.error("关闭FTP连接失败", e);
            }
        }
    }

    private void createRemoteDirectory(FTPClient ftpClient, String remoteDir) throws Exception {
        String[] directories = remoteDir.split("/");
        String currentDir = "";
        for (String dir : directories) {
            if (dir.isEmpty()) continue;
            currentDir += "/" + dir;
            if (!ftpClient.changeWorkingDirectory(currentDir)) {
                if (!ftpClient.makeDirectory(currentDir)) {
                    throw new Exception("创建目录失败: " + currentDir);
                }
                ftpClient.changeWorkingDirectory(currentDir);
            }
        }
    }
}
