package com.quantummind.service;

import com.quantummind.dto.AuthRequest;
import com.quantummind.dto.AuthResponse;
import com.quantummind.exception.CustomExceptions;
import com.quantummind.model.User;
import com.quantummind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new CustomExceptions.BadRequestException("Username is required");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomExceptions.ConflictException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomExceptions.ConflictException("Username is already taken");
        }
        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();
        userRepository.save(user);
        return responseFor(user);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Invalid credentials"));
        return responseFor(user);
    }

    public AuthResponse.UserInfo currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Authenticated user not found"));
        return toUserInfo(user);
    }

    public User currentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Authenticated user not found"));
    }

    private AuthResponse responseFor(User user) {
        String token = jwtService.generateToken(user.getEmail(), Map.of("userId", user.getId().toString(), "role", user.getRole().name()));
        return new AuthResponse(token, toUserInfo(user));
    }

    private AuthResponse.UserInfo toUserInfo(User user) {
        return new AuthResponse.UserInfo(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }
}
