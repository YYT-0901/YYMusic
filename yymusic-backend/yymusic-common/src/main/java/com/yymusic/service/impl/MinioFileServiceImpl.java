package com.yymusic.service.impl;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.lang.Assert;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.yymusic.entity.FileInfo;
import com.yymusic.service.FileService;
import io.minio.*;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;
import java.time.LocalDateTime;

@Service
@ConditionalOnProperty(value = "oss.type", havingValue = "minio")
@ConfigurationProperties(prefix = "oss.minio")
@RequiredArgsConstructor
@Data
@Slf4j
public class MinioFileServiceImpl implements FileService {

    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucketName;
    private String customDomain;

    private MinioClient minioClient;

    @PostConstruct
    public void init() {
        minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    @Override
    public FileInfo uploadFile(MultipartFile file, String folderName, String fileName) {
        createBucketIfAbsent(bucketName);

        String originalFilename = file.getOriginalFilename();
        String suffix = FileUtil.getSuffix(originalFilename);
        folderName = StrUtil.nullToEmpty(folderName);
        if (StrUtil.isEmpty(folderName)) {
            folderName = DateUtil.format(LocalDateTime.now(), "yyyyMMdd");
        } else {
            folderName = folderName.replaceAll("/+$", "");
        }
        if (StrUtil.isEmpty(fileName)) {
            fileName = IdUtil.simpleUUID() + "." + suffix;
        }

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(folderName + "/" + fileName)
                    .contentType(file.getContentType())
                    .stream(inputStream, file.getSize(), -1)
                    .build();
            minioClient.putObject(putObjectArgs);

            String fileUrl;
            if (StrUtil.isBlank(customDomain)) {
                GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs.builder()
                        .bucket(bucketName)
                        .object(folderName + "/" + fileName)
                        .method(Method.GET)
                        .build();
                fileUrl = minioClient.getPresignedObjectUrl(getPresignedObjectUrlArgs);
                fileUrl = fileUrl.substring(0, fileUrl.indexOf("?"));
            } else {
                fileUrl = customDomain + "/" + bucketName + "/" + folderName + "/" + fileName;
            }

            FileInfo fileInfo = new FileInfo();
            fileInfo.setName(originalFilename);
            fileInfo.setUrl(fileUrl);
            return fileInfo;
        } catch (Exception e) {
            log.error("上传文件失败", e);
            throw new RuntimeException("上传文件失败: " + e.getMessage());
        }
    }

    @Override
    public FileInfo uploadFile(InputStream inputStream, String folderName, String fileName, String originalFilename, String contentType) {
        createBucketIfAbsent(bucketName);

        folderName = StrUtil.nullToEmpty(folderName);
        if (StrUtil.isEmpty(folderName)) {
            folderName = DateUtil.format(LocalDateTime.now(), "yyyyMMdd");
        } else {
            folderName = folderName.replaceAll("/+$", "");
        }

        try {
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(folderName + "/" + fileName)
                    .contentType(contentType)
                    .stream(inputStream, -1, 10 * 1024 * 1024)
                    .build();
            minioClient.putObject(putObjectArgs);

            String fileUrl;
            if (StrUtil.isBlank(customDomain)) {
                GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs.builder()
                        .bucket(bucketName)
                        .object(folderName + "/" + fileName)
                        .method(Method.GET)
                        .build();
                fileUrl = minioClient.getPresignedObjectUrl(getPresignedObjectUrlArgs);
                fileUrl = fileUrl.substring(0, fileUrl.indexOf("?"));
            } else {
                fileUrl = customDomain + "/" + bucketName + "/" + folderName + "/" + fileName;
            }

            FileInfo fileInfo = new FileInfo();
            fileInfo.setName(originalFilename);
            fileInfo.setUrl(fileUrl);
            return fileInfo;
        } catch (Exception e) {
            log.error("上传文件失败", e);
            throw new RuntimeException("上传文件失败: " + e.getMessage());
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
        Assert.notBlank(filePath, "删除文件路径不能为空");
        try {
            String fileName;
            if (StrUtil.isNotBlank(customDomain)) {
                fileName = filePath.substring(customDomain.length() + 1 + bucketName.length() + 1);
            } else {
                fileName = filePath.substring(endpoint.length() + 1 + bucketName.length() + 1);
            }
            RemoveObjectArgs removeObjectArgs = RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileName)
                    .build();
            minioClient.removeObject(removeObjectArgs);
            return true;
        } catch (Exception e) {
            log.error("删除文件失败", e);
            throw new RuntimeException("删除文件失败: " + e.getMessage());
        }
    }

    private static String publicBucketPolicy(String bucketName) {
        return "{\"Version\":\"2012-10-17\","
                + "\"Statement\":[{\"Effect\":\"Allow\","
                + "\"Principal\":{\"AWS\":[\"*\"]},"
                + "\"Action\":[\"s3:ListBucketMultipartUploads\",\"s3:GetBucketLocation\",\"s3:ListBucket\"],"
                + "\"Resource\":[\"arn:aws:s3:::" + bucketName + "\"]},"
                + "{\"Effect\":\"Allow\"," + "\"Principal\":{\"AWS\":[\"*\"]},"
                + "\"Action\":[\"s3:ListMultipartUploadParts\",\"s3:PutObject\",\"s3:AbortMultipartUpload\",\"s3:DeleteObject\",\"s3:GetObject\"],"
                + "\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
    }

    @SneakyThrows
    private void createBucketIfAbsent(String bucketName) {
        BucketExistsArgs bucketExistsArgs = BucketExistsArgs.builder().bucket(bucketName).build();
        if (!minioClient.bucketExists(bucketExistsArgs)) {
            MakeBucketArgs makeBucketArgs = MakeBucketArgs.builder().bucket(bucketName).build();
            minioClient.makeBucket(makeBucketArgs);

            SetBucketPolicyArgs setBucketPolicyArgs = SetBucketPolicyArgs
                    .builder()
                    .bucket(bucketName)
                    .config(publicBucketPolicy(bucketName))
                    .build();
            minioClient.setBucketPolicy(setBucketPolicyArgs);
        }
    }
}
