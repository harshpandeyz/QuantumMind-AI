package com.quantummind.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentDto(
        UUID id,
        String originalFilename,
        Long fileSize,
        Instant uploadedAt,
        String processingStatus,
        String summary
) {}
