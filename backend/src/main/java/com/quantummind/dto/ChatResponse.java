package com.quantummind.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ChatResponse(
        UUID sessionId,
        UUID messageId,
        String response,
        List<String> sources,
        Instant createdAt
) {}
