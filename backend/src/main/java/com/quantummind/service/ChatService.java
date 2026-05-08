package com.quantummind.service;

import com.quantummind.dto.*;
import com.quantummind.exception.CustomExceptions;
import com.quantummind.model.ChatMessage;
import com.quantummind.model.ChatSession;
import com.quantummind.model.User;
import com.quantummind.repository.ChatHistoryRepository;
import com.quantummind.repository.ChatSessionRepository;
import com.quantummind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final AuthService authService;
    private final ChatSessionRepository sessionRepository;
    private final ChatHistoryRepository messageRepository;
    private final AIProxyService aiProxyService;
    private final UserRepository userRepository;

    @Transactional
    public ChatSessionDto createSession(String title) {
        User user = authService.currentUserEntity();
        ChatSession session = ChatSession.builder()
                .user(user)
                .title(title == null || title.isBlank() ? "New Quantum Thread" : title.trim())
                .build();
        return toDto(sessionRepository.save(session));
    }

    public List<ChatSessionDto> sessions() {
        return sessionRepository.findByUserOrderByUpdatedAtDesc(authService.currentUserEntity()).stream().map(this::toDto).toList();
    }

    public List<ChatMessageDto> messages(UUID sessionId) {
        ChatSession session = ownedSession(sessionId);
        return messageRepository.findBySessionOrderByCreatedAtAsc(session).stream().map(this::toDto).toList();
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public ChatResponse sendMessage(UUID sessionId, ChatRequest request) {
        User user = authService.currentUserEntity();
        ChatSession session = ownedSession(sessionId, user);
        messageRepository.save(ChatMessage.builder()
                .session(session)
                .role(ChatMessage.Role.user)
                .content(request.message())
                .build());

        Map<String, Object> ai = aiProxyService.chat(sessionId, request.message(), request.documentIds(), request.useRag(), user.getId().toString());
        String responseText = String.valueOf(ai.getOrDefault("response", "I could not generate a response."));
        List<String> sources = ai.get("sources") instanceof List<?> list ? list.stream().map(String::valueOf).toList() : List.of();

        ChatMessage assistant = messageRepository.save(ChatMessage.builder()
                .session(session)
                .role(ChatMessage.Role.assistant)
                .content(responseText)
                .build());
        if ("New Quantum Thread".equals(session.getTitle())) {
            session.setTitle(request.message().length() > 60 ? request.message().substring(0, 60) + "..." : request.message());
        }
        sessionRepository.save(session);
        return new ChatResponse(session.getId(), assistant.getId(), responseText, sources, assistant.getCreatedAt());
    }

    @Transactional
    public StreamContext startStreamMessage(UUID sessionId, ChatRequest request, String email) {
        User user = userByEmail(email);
        ChatSession session = ownedSession(sessionId, user);
        messageRepository.save(ChatMessage.builder()
                .session(session)
                .role(ChatMessage.Role.user)
                .content(request.message())
                .build());
        if ("New Quantum Thread".equals(session.getTitle())) {
            session.setTitle(request.message().length() > 60 ? request.message().substring(0, 60) + "..." : request.message());
            sessionRepository.save(session);
        }
        return new StreamContext(session.getId(), user.getId().toString(), request.message(), request.documentIds(), request.useRag());
    }

    @Transactional
    public ChatResponse completeStreamMessage(UUID sessionId, String email, String responseText, List<String> sources) {
        User user = userByEmail(email);
        ChatSession session = ownedSession(sessionId, user);
        ChatMessage assistant = messageRepository.save(ChatMessage.builder()
                .session(session)
                .role(ChatMessage.Role.assistant)
                .content(responseText == null || responseText.isBlank() ? "No response received." : responseText)
                .build());
        sessionRepository.save(session);
        return new ChatResponse(session.getId(), assistant.getId(), assistant.getContent(), sources == null ? List.of() : sources, assistant.getCreatedAt());
    }

    public void streamMessage(UUID sessionId, ChatRequest request, String email, SseEmitter emitter) {
        StreamContext context = startStreamMessage(sessionId, request, email);
        try {
            AIProxyService.StreamResult result = aiProxyService.streamChat(
                    context.sessionId(),
                    context.message(),
                    context.documentIds(),
                    context.useRag(),
                    context.userId(),
                    token -> sendStreamEvent(emitter, java.util.Map.of("token", token))
            );
            ChatResponse response = completeStreamMessage(sessionId, email, result.response(), result.sources());
            sendStreamEvent(emitter, java.util.Map.of(
                    "done", true,
                    "messageId", response.messageId().toString(),
                    "createdAt", response.createdAt().toString(),
                    "sources", response.sources()
            ));
            emitter.complete();
        } catch (Exception ex) {
            try {
                sendStreamEvent(emitter, java.util.Map.of("error", ex.getMessage() == null ? "Streaming failed" : ex.getMessage()));
            } catch (Exception ignored) {
            }
            emitter.completeWithError(ex);
        }
    }

    private ChatSession ownedSession(UUID sessionId) {
        return ownedSession(sessionId, authService.currentUserEntity());
    }

    private ChatSession ownedSession(UUID sessionId, User user) {
        return sessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new CustomExceptions.NotFoundException("Chat session not found"));
    }

    private User userByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomExceptions.UnauthorizedException("Authenticated user not found"));
    }

    private void sendStreamEvent(SseEmitter emitter, Object data) {
        try {
            emitter.send(SseEmitter.event().data(data));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not send stream event", ex);
        }
    }

    private ChatSessionDto toDto(ChatSession session) {
        return new ChatSessionDto(session.getId(), session.getTitle(), session.getCreatedAt(), session.getUpdatedAt());
    }

    private ChatMessageDto toDto(ChatMessage message) {
        return new ChatMessageDto(message.getId(), message.getRole().name(), message.getContent(), message.getCreatedAt());
    }

    public record StreamContext(UUID sessionId, String userId, String message, List<UUID> documentIds, boolean useRag) {}
}
