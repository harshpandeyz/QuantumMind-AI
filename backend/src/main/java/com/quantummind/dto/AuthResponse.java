package com.quantummind.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        UserInfo user
) {
    public record UserInfo(UUID id, String username, String email, String role) {}
}
