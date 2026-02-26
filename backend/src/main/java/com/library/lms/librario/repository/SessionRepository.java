package com.library.lms.librario.repository;

import com.library.lms.librario.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SessionRepository {
    Optional<Session> findByToken(String token);
}
