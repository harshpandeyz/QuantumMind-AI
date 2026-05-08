package com.quantummind.controller;

import com.quantummind.dto.AuthRequest;
import com.quantummind.dto.AuthResponse;
import com.quantummind.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        log.info("[AuthController] Register request for: {}", request.getEmail());
        try {
            sanitizeInput(request);
            AuthResponse response = authService.register(request);
            log.info("[AuthController] Registration successful for: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            log.error("[AuthController] Registration failed for: {}", request.getEmail(), ex);
            throw ex;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.info("[AuthController] Login attempt for: {}", request.getEmail());
        try {
            sanitizeInput(request);
            AuthResponse response = authService.login(request);
            log.info("[AuthController] Login successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.warn("[AuthController] Login failed for: {}", request.getEmail());
            throw ex;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserInfo> me() {
        try {
            AuthResponse.UserInfo userInfo = authService.currentUser();
            log.debug("[AuthController] Retrieved user info");
            return ResponseEntity.ok(userInfo);
        } catch (Exception ex) {
            log.error("[AuthController] Failed to retrieve current user info", ex);
            throw ex;
        }
    }

    private void sanitizeInput(AuthRequest request) {
        if (request.getEmail() != null) {
            request.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getPassword() != null) {
            request.setPassword(request.getPassword().trim());
        }
    }
}
