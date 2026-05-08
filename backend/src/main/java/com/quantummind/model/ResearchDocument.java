package com.quantummind.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "research_documents", indexes = {
        @Index(name = "idx_documents_user_uploaded", columnList = "user_id, uploaded_at"),
        @Index(name = "idx_documents_user_status", columnList = "user_id, processing_status")
})
public class ResearchDocument {
    public enum ProcessingStatus { PENDING, PROCESSING, COMPLETED, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false, name = "original_filename")
    private String originalFilename;

    @Column(nullable = false, name = "stored_filename")
    private String storedFilename;

    @Column(nullable = false, name = "file_path")
    private String filePath;

    @Column(nullable = false, name = "file_size")
    private Long fileSize;

    @Column(nullable = false, updatable = false, name = "uploaded_at")
    private Instant uploadedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30, name = "processing_status")
    private ProcessingStatus processingStatus;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT", name = "embedding_ids")
    private String embeddingIds;

    @PrePersist
    void prePersist() {
        uploadedAt = Instant.now();
        if (processingStatus == null) {
            processingStatus = ProcessingStatus.PENDING;
        }
    }
}
