package com.example.NewsAI.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis read failed for cache {}; continuing without cache ({})",
                        cache.getName(), exception.getClass().getSimpleName());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis write failed for cache {}; response remains available ({})",
                        cache.getName(), exception.getClass().getSimpleName());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis eviction failed for cache {} ({})",
                        cache.getName(), exception.getClass().getSimpleName());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis clear failed for cache {} ({})",
                        cache.getName(), exception.getClass().getSimpleName());
            }
        };
    }
}
