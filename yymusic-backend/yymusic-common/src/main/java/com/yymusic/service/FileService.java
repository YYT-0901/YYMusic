package com.yymusic.service;

import com.yymusic.entity.FileInfo;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;

public interface FileService {

    FileInfo uploadFile(MultipartFile file, String folderName, String fileName);

    FileInfo uploadFile(InputStream inputStream, String folderName, String fileName, String originalFilename, String contentType);

    FileInfo downloadFile(URL url, String folderName, String fileName, String suffix);

    boolean deleteFile(String filePath);
}
