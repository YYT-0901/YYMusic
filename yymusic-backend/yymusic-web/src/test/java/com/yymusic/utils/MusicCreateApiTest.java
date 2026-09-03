package com.yymusic.utils;

import com.yymusic.api.impl.MusicCreateApi4ComfyUIImpl;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.ResourceLock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
public class MusicCreateApiTest {

    @Resource
    private MusicCreateApi4ComfyUIImpl comfyAPI;

    @Test
    public void testCreateMusic() {
        comfyAPI.createMusic("", "", "");
    }
}
