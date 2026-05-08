package com.quantummind.repository;

import com.quantummind.model.ChatSession;
import com.quantummind.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByUserOrderByUpdatedAtDesc(User user);
    Optional<ChatSession> findByIdAndUser(UUID id, User user);
    long countByUser(User user);
}
