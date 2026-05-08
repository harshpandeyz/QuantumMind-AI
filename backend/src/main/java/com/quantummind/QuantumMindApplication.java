package com.quantummind;

import com.quantummind.config.JwtConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@EnableConfigurationProperties(JwtConfig.class)
@SpringBootApplication
public class QuantumMindApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuantumMindApplication.class, args);
    }
}
