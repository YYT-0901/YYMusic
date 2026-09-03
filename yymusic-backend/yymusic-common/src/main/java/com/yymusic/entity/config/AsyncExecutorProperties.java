package com.yymusic.entity.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "yymusic.async")
@Data
public class AsyncExecutorProperties {

    private PoolProperties backgroundExecutor = new PoolProperties(4, 4, 16, 60);

    private PoolProperties comfyCreateExecutor = new PoolProperties(4, 8, 200, 60);

    private PoolProperties mvcExecutor = new PoolProperties(4, 16, 200, 60);

    private long mvcDefaultTimeoutMs = 120000;

    @Data
    public static class PoolProperties {
        private int corePoolSize;
        private int maxPoolSize;
        private int queueCapacity;
        private int keepAliveSeconds;

        public PoolProperties() {
        }

        public PoolProperties(int corePoolSize, int maxPoolSize, int queueCapacity, int keepAliveSeconds) {
            this.corePoolSize = corePoolSize;
            this.maxPoolSize = maxPoolSize;
            this.queueCapacity = queueCapacity;
            this.keepAliveSeconds = keepAliveSeconds;
        }
    }
}
