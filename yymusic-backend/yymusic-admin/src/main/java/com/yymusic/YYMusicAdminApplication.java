package com.yymusic;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication(scanBasePackages = {"com.yymusic"})
@MapperScan(basePackages = {"com.yymusic.mappers"})
@EnableTransactionManagement
@EnableScheduling
@EnableAsync
public class YYMusicAdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(YYMusicAdminApplication.class, args);
    }
}
