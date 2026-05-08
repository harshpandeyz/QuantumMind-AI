package com.quantummind.controller;

import com.quantummind.dto.*;
import com.quantummind.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final java.util.concurrent.ConcurrentHashMap<String, io.github.bucket4j.Bucket> rateLimiters =
        new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ExecutorService streamExecutor =
        java.util.concurrent.Executors.newCachedThreadPool();

    private io.github.bucket4j.Bucket getBucket(String userId) {
        return rateLimiters.computeIfAbsent(userId, k ->
            io.github.bucket4j.Bucket.builder()
                .addLimit(io.github.bucket4j.Bandwidth.simple(30, java.time.Duration.ofMinutes(1)))
                .build());
    }

    @PostMapping("/sessions")
    public ChatSessionDto createSession(@RequestBody(required = false) Map<String, String> body) {
        return chatService.createSession(body == null ? null : body.get("title"));
    }

    @GetMapping("/sessions")
    public List<ChatSessionDto> sessions() {
        return chatService.sessions();
    }

    @GetMapping("/sessions/{id}/messages")
    public List<ChatMessageDto> messages(@PathVariable UUID id) {
        return chatService.messages(id);
    }

    @PostMapping("/sessions/{id}/messages")
    public ChatResponse send(@PathVariable UUID id, @Valid @RequestBody ChatRequest request, Authentication authentication) {
        String userId = authentication.getName();
        if (!getBucket(userId).tryConsume(1)) {
            throw new com.quantummind.exception.CustomExceptions.RateLimitException(
                "Rate limit exceeded: 30 messages per minute.");
        }
        return chatService.sendMessage(id, request);
    }

    @GetMapping(value = "/sessions/{id}/stream",
                produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter stream(
            @PathVariable UUID id,
            @RequestParam String message,
            @RequestParam(defaultValue = "false") boolean useRag,
            @RequestParam(required = false) java.util.List<UUID> documentIds,
            Authentication authentication) {

        String userEmail = authentication.getName();
        if (!getBucket(userEmail).tryConsume(1)) {
            throw new com.quantummind.exception.CustomExceptions.RateLimitException(
                "Rate limit exceeded: 30 messages per minute.");
        }

        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter =
            new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(120_000L);

        streamExecutor.submit(() -> {
            ChatRequest req = new ChatRequest(message, documentIds, useRag);
            chatService.streamMessage(id, req, userEmail, emitter);
        });
        return emitter;
    }
}
