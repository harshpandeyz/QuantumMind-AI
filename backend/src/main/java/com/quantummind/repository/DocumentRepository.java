package com.quantummind.repository;

import com.quantummind.model.ResearchDocument;
import com.quantummind.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<ResearchDocument, UUID> {
    List<ResearchDocument> findByUserOrderByUploadedAtDesc(User user);
    Optional<ResearchDocument> findByIdAndUser(UUID id, User user);
    long countByUser(User user);
    long countByUserAndProcessingStatus(User user, ResearchDocument.ProcessingStatus status);
}
