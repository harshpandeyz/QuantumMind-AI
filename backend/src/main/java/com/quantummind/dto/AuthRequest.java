package com.quantummind.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthRequest {
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;
}
