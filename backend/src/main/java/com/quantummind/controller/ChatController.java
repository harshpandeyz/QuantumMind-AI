package com.quantummind.controller;

import com.quantummind.dto.*;
import com.quantummind.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final ConcurrentHashMap<String, RateLimiterState> rateLimiters = new ConcurrentHashMap<>();
    private final java.util.concurrent.ExecutorService streamExecutor =
        new ThreadPoolExecutor(
            10,
            50,
            60L,
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );

    private boolean tryConsume(String userId) {
        Instant now = Instant.now();
        cleanupRateLimiters(now);
        Instant cutoff = now.minusSeconds(60);
        RateLimiterState limiter = rateLimiters.computeIfAbsent(userId, key -> new RateLimiterState());
        synchronized (limiter) {
            limiter.lastAccess = now;
            while (!limiter.requests.isEmpty() && limiter.requests.peekFirst().isBefore(cutoff)) {
                limiter.requests.removeFirst();
            }
            if (limiter.requests.size() >= 30) {
                return false;
            }
            limiter.requests.addLast(now);
            return true;
        }
    }

    private void cleanupRateLimiters(Instant now) {
        Instant staleBefore = now.minusSeconds(300);
        rateLimiters.entrySet().removeIf(entry -> {
            RateLimiterState limiter = entry.getValue();
            synchronized (limiter) {
                while (!limiter.requests.isEmpty() && limiter.requests.peekFirst().isBefore(now.minusSeconds(60))) {
                    limiter.requests.removeFirst();
                }
                return limiter.requests.isEmpty() && limiter.lastAccess.isBefore(staleBefore);
            }
        });
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
        if (!tryConsume(userId)) {
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
        if (!tryConsume(userEmail)) {
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

    private static class RateLimiterState {
        private final Deque<Instant> requests = new ArrayDeque<>();
        private Instant lastAccess = Instant.now();
    }
}
