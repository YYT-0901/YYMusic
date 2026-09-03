package com.yymusic.redis;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig<V> {

    @Bean("redisTemplate")
    public RedisTemplate<String, V> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, V> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // 1. 定义 String 序列化器 (用于 Key)
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        // 2. 定义 Jackson 序列化器 (用于 Value)，并自定义 ObjectMapper
        ObjectMapper om = new ObjectMapper();
        // 设置可见性，确保私有属性也能被序列化
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);

        // [关键步骤] 开启类型白名单，存入类信息
        om.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        // 使用配置好的 ObjectMapper 构建序列化器
        GenericJackson2JsonRedisSerializer jacksonSerializer = new GenericJackson2JsonRedisSerializer(om);

        // 3. 设置 Key 和 Value 的序列化方式
        template.setKeySerializer(stringRedisSerializer);
        template.setValueSerializer(jacksonSerializer);

        // 4. 设置 Hash Key 和 Hash Value 的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
        template.setHashValueSerializer(jacksonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}