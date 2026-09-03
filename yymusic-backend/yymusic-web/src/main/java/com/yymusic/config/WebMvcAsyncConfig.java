package com.yymusic.config;

import com.yymusic.entity.config.AsyncExecutorProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class WebMvcAsyncConfig implements WebMvcConfigurer {

    private final AsyncExecutorProperties asyncExecutorProperties;

    public WebMvcAsyncConfig(AsyncExecutorProperties asyncExecutorProperties) {
        this.asyncExecutorProperties = asyncExecutorProperties;
    }

    @Bean(name = "mvcAsyncTaskExecutor")
    public ThreadPoolTaskExecutor mvcAsyncTaskExecutor() {
        AsyncExecutorProperties.PoolProperties properties = asyncExecutorProperties.getMvcExecutor();
        int corePoolSize = Math.max(1, properties.getCorePoolSize());
        int maxPoolSize = Math.max(corePoolSize, properties.getMaxPoolSize());
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(Math.max(1, properties.getQueueCapacity()));
        executor.setKeepAliveSeconds(Math.max(0, properties.getKeepAliveSeconds()));
        executor.setThreadNamePrefix("mvc-async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        executor.initialize();
        return executor;
    }

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setTaskExecutor(mvcAsyncTaskExecutor());
        configurer.setDefaultTimeout(asyncExecutorProperties.getMvcDefaultTimeoutMs());
    }
}
