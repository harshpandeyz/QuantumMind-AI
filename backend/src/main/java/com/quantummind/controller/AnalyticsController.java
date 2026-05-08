package com.quantummind.controller;

import com.quantummind.model.ResearchDocument;
import com.quantummind.model.User;
import com.quantummind.repository.ChatHistoryRepository;
import com.quantummind.repository.ChatSessionRepository;
import com.quantummind.repository.DocumentRepository;
import com.quantummind.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AuthService authService;
    private final DocumentRepository documentRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        User user = authService.currentUserEntity();
        long docs = documentRepository.countByUser(user);
        long completed = documentRepository.countByUserAndProcessingStatus(user, ResearchDocument.ProcessingStatus.COMPLETED);
        long processing = documentRepository.countByUserAndProcessingStatus(user, ResearchDocument.ProcessingStatus.PROCESSING);
        long failed = documentRepository.countByUserAndProcessingStatus(user, ResearchDocument.ProcessingStatus.FAILED);
        return Map.of(
                "totalDocuments", docs,
                "chatSessions", chatSessionRepository.countByUser(user),
                "queriesToday", chatHistoryRepository.countBySession_User(user),
                "knowledgeBaseSize", completed,
                "documentsByStatus", Map.of("completed", completed, "processing", processing, "failed", failed, "pending", Math.max(0, docs - completed - processing - failed))
        );
    }
}
