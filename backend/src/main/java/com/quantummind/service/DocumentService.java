package com.quantummind.service;

import com.quantummind.dto.DocumentDto;
import com.quantummind.exception.CustomExceptions;
import com.quantummind.model.ResearchDocument;
import com.quantummind.model.User;
import com.quantummind.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final long MAX_UPLOAD_BYTES = 50L * 1024L * 1024L;

    private final AuthService authService;
    private final DocumentRepository documentRepository;
    private final DocumentProcessingService documentProcessingService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public DocumentDto upload(MultipartFile file) {
        validateUpload(file);

        User user = authService.currentUserEntity();
        String filename = file.getOriginalFilename() == null ? "document.pdf" : file.getOriginalFilename();
        String safeFilename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");

        try {
            Path rootDir = Path.of(uploadDir).toAbsolutePath().normalize();
            Path userDir = rootDir.resolve(user.getId().toString()).normalize();
            if (!userDir.startsWith(rootDir)) {
                throw new CustomExceptions.BadRequestException("Invalid upload path");
            }
            Files.createDirectories(userDir);

            String stored = UUID.randomUUID() + "-" + safeFilename;
            Path destination = userDir.resolve(stored).normalize();
            if (!destination.startsWith(userDir)) {
                throw new CustomExceptions.BadRequestException("Invalid file name");
            }
            file.transferTo(destination);

            ResearchDocument document = documentRepository.save(ResearchDocument.builder()
                    .user(user)
                    .originalFilename(filename)
                    .storedFilename(stored)
                    .filePath(destination.toString())
                    .fileSize(file.getSize())
                    .processingStatus(ResearchDocument.ProcessingStatus.PENDING)
                    .build());

            log.info("[DocumentService] File '{}' saved for user {}, triggering async processing", filename, user.getId());
            documentProcessingService.processAsync(document.getId(), user.getId().toString());
            return toDto(document);
        } catch (IOException ex) {
            throw new CustomExceptions.BadRequestException("Could not store file: " + ex.getMessage());
        }
    }

    public List<DocumentDto> list() {
        return documentRepository.findByUserOrderByUploadedAtDesc(authService.currentUserEntity())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        ResearchDocument document = ownedDocument(id);
        try {
            Files.deleteIfExists(Path.of(document.getFilePath()));
        } catch (IOException ex) {
            log.warn("[DocumentService] Could not delete file for document {}: {}", id, ex.getMessage());
        }
        documentRepository.delete(document);
        log.info("[DocumentService] Document {} deleted", id);
    }

    public DocumentDto summary(UUID id) {
        return toDto(ownedDocument(id));
    }

    private void validateUpload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new CustomExceptions.BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new CustomExceptions.BadRequestException("PDF must be 50MB or smaller");
        }
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String contentType = file.getContentType() == null ? "" : file.getContentType();
        if (!filename.toLowerCase().endsWith(".pdf") || !List.of("application/pdf", "application/x-pdf").contains(contentType)) {
            throw new CustomExceptions.BadRequestException("Only PDF files are supported");
        }
    }

    private ResearchDocument ownedDocument(UUID id) {
        return documentRepository.findByIdAndUser(id, authService.currentUserEntity())
                .orElseThrow(() -> new CustomExceptions.NotFoundException("Document not found"));
    }

    private DocumentDto toDto(ResearchDocument document) {
        return new DocumentDto(
                document.getId(),
                document.getOriginalFilename(),
                document.getFileSize(),
                document.getUploadedAt(),
                document.getProcessingStatus().name(),
                document.getSummary()
        );
    }
}
