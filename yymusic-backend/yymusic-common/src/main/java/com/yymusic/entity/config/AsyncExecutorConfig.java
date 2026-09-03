package com.yymusic.entity.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class AsyncExecutorConfig {

    @Bean(name = "backgroundTaskExecutor", destroyMethod = "shutdownNow")
    public ExecutorService backgroundTaskExecutor(AsyncExecutorProperties properties) {
        return buildExecutor(properties.getBackgroundExecutor(), "background-task");
    }

    @Bean(name = "comfyCreateExecutor", destroyMethod = "shutdownNow")
    public ExecutorService comfyCreateExecutor(AsyncExecutorProperties properties) {
        return buildExecutor(properties.getComfyCreateExecutor(), "comfy-create");
    }

    private ExecutorService buildExecutor(AsyncExecutorProperties.PoolProperties properties, String threadNamePrefix) {
        int corePoolSize = Math.max(1, properties.getCorePoolSize());
        int maxPoolSize = Math.max(corePoolSize, properties.getMaxPoolSize());
        int queueCapacity = Math.max(1, properties.getQueueCapacity());
        int keepAliveSeconds = Math.max(0, properties.getKeepAliveSeconds());
        AtomicInteger threadCounter = new AtomicInteger(1);

        return new ThreadPoolExecutor(
                corePoolSize,
                maxPoolSize,
                keepAliveSeconds,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(queueCapacity),
                runnable -> {
                    Thread thread = new Thread(runnable);
                    thread.setName(threadNamePrefix + "-" + threadCounter.getAndIncrement());
                    return thread;
                },
                new ThreadPoolExecutor.AbortPolicy()
        );
    }
}
