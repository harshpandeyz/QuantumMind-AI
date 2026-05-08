package com.quantummind.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secret = "quantummind-super-secret-jwt-key-2024-minimum-256-bits-long";
    private long expiration = 86400000L;
}
