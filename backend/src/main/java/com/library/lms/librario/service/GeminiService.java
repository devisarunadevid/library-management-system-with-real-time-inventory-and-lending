package com.library.lms.librario.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService() {
        // Initialize Gemini client; uses GEMINI_API_KEY automatically from env
        this.client = new Client();
    }

    /**
     * Generates a response from Gemini AI based on user role, question, and app data.
     *
     * @param role User role: ADMIN, LIBRARIAN, MEMBER
     * @param question The question asked by user
     * @param context Map of app-specific data to include (e.g., borrowedBooks, overdue info)
     * @return AI-generated answer
     */
    public String askGemini(String role, String question, Map<String, Object> context) {
        try {
            // Build context string for AI prompt
            StringBuilder contextText = new StringBuilder("You are Librario AI assistant.\n");
            contextText.append("User Role: ").append(role).append("\n");
            contextText.append("App Data Context:\n");
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                contextText.append("- ").append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
            }
            contextText.append("Question: ").append(question).append("\n");
            contextText.append("Provide a detailed, accurate, and user-friendly answer.");

            // Call Gemini 2.5 Flash model
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.5-flash",
                    contextText.toString(),
                    null
            );

            return response.text();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating response: " + e.getMessage();
        }
    }
}
