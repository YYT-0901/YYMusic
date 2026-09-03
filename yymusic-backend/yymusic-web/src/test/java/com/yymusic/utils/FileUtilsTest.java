package com.yymusic.utils;

import com.yymusic.entity.FileInfo;
import com.yymusic.service.FileService;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class FileUtilsTest {

    @Resource
    private FileUtils fileUtils;

    @Resource
    private FileService fileService;

    @Test
    public void testUploadFile() {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "Hello World".getBytes()
        );

        String result = fileUtils.uploadFile(mockFile, "test", "test.txt");
        
        assertNotNull(result);
        System.out.println("Upload result: " + result);
    }

    @Test
    public void testUploadFileWithDefaultFolder() {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "test2.txt",
                "text/plain",
                "Test Content".getBytes()
        );

        String result = fileUtils.uploadFile(mockFile, null, null);
        
        assertNotNull(result);
        System.out.println("Upload result (default folder): " + result);
    }

    @Test
    public void testCopyAvatar() {
        String result = fileUtils.copyAvatar("123456");
        
        assertNotNull(result);
        System.out.println("Avatar copy result: " + result);
    }

    @Test
    public void testDeleteFile() {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "delete_test.txt",
                "text/plain",
                "Delete test".getBytes()
        );

        String result = fileUtils.uploadFile(mockFile, "delete_test", "delete_test.txt");
        assertNotNull(result);

        fileUtils.deleteFile(result);
        System.out.println("File deleted successfully");
    }

    @Test
    public void testFileServiceDirectly() {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "direct_test.txt",
                "text/plain",
                "Direct test".getBytes()
        );

        FileInfo fileInfo = fileService.uploadFile(mockFile, "direct", "direct_test.txt");
        
        assertNotNull(fileInfo);
        assertNotNull(fileInfo.getUrl());
        System.out.println("FileInfo URL: " + fileInfo.getUrl());
        System.out.println("FileInfo Name: " + fileInfo.getName());

        fileService.deleteFile(fileInfo.getUrl());
    }
}
