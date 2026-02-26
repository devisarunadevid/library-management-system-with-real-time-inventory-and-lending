package com.library.lms.librario.controller;

import com.library.lms.librario.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    /**
     * Endpoint for asking Librario AI questions.
     *
     * Example JSON POST body:
     * {
     *    "role": "ADMIN",
     *    "question": "How much overdue is there for member John Doe?",
     *    "context": {
     *        "borrowedBooks": [...],
     *        "overdueInfo": {...}
     *    }
     * }
     */
    @PostMapping("/ask")
    public String askGemini(@RequestBody GeminiRequest request) {
        return geminiService.askGemini(
                request.getRole(),
                request.getQuestion(),
                request.getContext()
        );
    }

    // Inner static class to map request JSON
    public static class GeminiRequest {
        private String role;
        private String question;
        private Map<String, Object> context;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }

        public Map<String, Object> getContext() { return context; }
        public void setContext(Map<String, Object> context) { this.context = context; }
    }
}
