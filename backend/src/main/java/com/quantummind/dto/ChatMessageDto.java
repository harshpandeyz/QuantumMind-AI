package com.quantummind.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageDto(UUID id, String role, String content, Instant createdAt) {}
