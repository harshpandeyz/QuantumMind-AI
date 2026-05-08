package com.quantummind.repository;

import com.quantummind.model.ChatMessage;
import com.quantummind.model.ChatSession;
import com.quantummind.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatHistoryRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findBySessionOrderByCreatedAtAsc(ChatSession session);
    long countBySession_User(User user);
}
