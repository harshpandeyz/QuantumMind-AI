package com.quantummind.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quantummind.model.ResearchDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIProxyService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @SuppressWarnings("unchecked")
    public Map<String, Object> chat(UUID sessionId, String message, List<UUID> documentIds, boolean useRag, String userId) {
        try {
            Map<String, Object> body = Map.of(
                    "session_id", sessionId.toString(),
                    "message", message,
                    "document_ids", documentIds == null ? List.of() : documentIds.stream().map(UUID::toString).toList(),
                    "use_rag", useRag
            );
            ResponseEntity<Map> response = restTemplate.exchange(
                    aiServiceUrl + "/chat",
                    HttpMethod.POST,
                    entity(body, userId),
                    Map.class
            );
            return response.getBody() == null ? Map.of("response", "No response received.") : response.getBody();
        } catch (RestClientException ex) {
            log.error("[AIProxy] Chat call failed: {}", ex.getMessage());
            return Map.of(
                    "response", "AI service is temporarily unavailable. Please try again in a moment.",
                    "sources", List.of()
            );
        }
    }

    public StreamResult streamChat(
            UUID sessionId,
            String message,
            List<UUID> documentIds,
            boolean useRag,
            String userId,
            Consumer<String> tokenConsumer
    ) {
        try {
            Map<String, Object> body = Map.of(
                    "session_id", sessionId.toString(),
                    "message", message,
                    "document_ids", documentIds == null ? List.of() : documentIds.stream().map(UUID::toString).toList(),
                    "use_rag", useRag
            );
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/chat/stream"))
                    .timeout(Duration.ofSeconds(120))
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .header("X-User-Id", userId)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<Stream<String>> response = httpClient.send(request, HttpResponse.BodyHandlers.ofLines());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("AI stream failed with status " + response.statusCode());
            }

            StringBuilder content = new StringBuilder();
            List<String> sources = new ArrayList<>();
            try (Stream<String> lines = response.body()) {
                lines.forEach(line -> handleStreamLine(line, tokenConsumer, content, sources));
            }
            return new StreamResult(content.toString(), sources);
        } catch (Exception ex) {
            log.error("[AIProxy] Streaming chat call failed: {}", ex.getMessage());
            throw new IllegalStateException("AI streaming failed: " + ex.getMessage(), ex);
        }
    }

    public void processDocument(ResearchDocument document, String userId) {
        try {
            Map<String, Object> body = Map.of(
                    "document_id", document.getId().toString(),
                    "file_path", document.getFilePath()
            );
            restTemplate.exchange(aiServiceUrl + "/embeddings/document", HttpMethod.POST, entity(body, userId), Map.class);
            log.info("[AIProxy] Document {} processed successfully", document.getId());
        } catch (RestClientException ex) {
            log.error("[AIProxy] Document processing failed for {}: {}", document.getId(), ex.getMessage());
            throw new RuntimeException("AI document processing failed: " + ex.getMessage(), ex);
        }
    }

    @SuppressWarnings("unchecked")
    public String summarizeDocument(ResearchDocument document, String userId) {
        try {
            Map<String, Object> body = Map.of(
                    "session_id", "summary-" + document.getId(),
                    "message", "Provide a comprehensive summary of this research document for a quantum computing research team. Include: main topic, key findings, methodologies used, and practical applications.",
                    "document_ids", List.of(document.getId().toString()),
                    "use_rag", true
            );
            ResponseEntity<Map> response = restTemplate.exchange(aiServiceUrl + "/chat", HttpMethod.POST, entity(body, userId), Map.class);
            Object text = response.getBody() == null ? null : response.getBody().get("response");
            return text == null ? "Summary is being generated." : text.toString();
        } catch (RestClientException ex) {
            log.warn("[AIProxy] Summary generation failed for {}: {}", document.getId(), ex.getMessage());
            return "Document has been indexed and is ready for RAG queries. Automatic summary is temporarily unavailable.";
        }
    }

    private HttpEntity<Map<String, Object>> entity(Map<String, Object> body, String userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", userId);
        return new HttpEntity<>(body, headers);
    }

    private void handleStreamLine(String line, Consumer<String> tokenConsumer, StringBuilder content, List<String> sources) {
        if (line == null || !line.startsWith("data: ")) {
            return;
        }
        String payload = line.substring(6).trim();
        if (payload.isBlank()) {
            return;
        }
        try {
            JsonNode node = objectMapper.readTree(payload);
            if (node.hasNonNull("token")) {
                String token = node.get("token").asText();
                content.append(token);
                tokenConsumer.accept(token);
            }
            if (node.has("sources") && node.get("sources").isArray()) {
                node.get("sources").forEach(source -> sources.add(source.asText()));
            }
            if (node.hasNonNull("error")) {
                throw new IllegalStateException(node.get("error").asText());
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Could not parse AI stream event", ex);
        }
    }

    public record StreamResult(String response, List<String> sources) {}
}
