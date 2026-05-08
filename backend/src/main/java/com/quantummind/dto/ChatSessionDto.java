package com.quantummind.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatSessionDto(UUID id, String title, Instant createdAt, Instant updatedAt) {}
