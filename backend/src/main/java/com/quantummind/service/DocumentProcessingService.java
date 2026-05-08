package com.quantummind.service;

import com.quantummind.model.ResearchDocument;
import com.quantummind.model.ResearchDocument.ProcessingStatus;
import com.quantummind.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessingService {

    private final DocumentRepository documentRepository;
    private final AIProxyService aiProxyService;

    @Async
    @Transactional
    public void processAsync(UUID docId, String userId) {
        ResearchDocument doc = documentRepository.findById(docId)
            .orElseThrow(() -> new RuntimeException("Document not found: " + docId));

        doc.setProcessingStatus(ProcessingStatus.PROCESSING);
        documentRepository.save(doc);

        try {
            aiProxyService.processDocument(doc, userId);
            String summary = aiProxyService.summarizeDocument(doc, userId);
            doc.setProcessingStatus(ProcessingStatus.COMPLETED);
            doc.setSummary(summary);
            log.info("[DocumentProcessingService] Doc {} completed", docId);
        } catch (Exception ex) {
            log.error("[DocumentProcessingService] Failed for doc {}: {}", docId, ex.getMessage());
            doc.setProcessingStatus(ProcessingStatus.FAILED);
        }
        documentRepository.save(doc);
    }
}
