package com.library.lms.librario.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public Map<String, Object> getStats() {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM borrow_request WHERE status = 'APPROVED') AS booksIssued,
                (SELECT COUNT(*) FROM borrow_record WHERE status = 'RETURNED') AS booksReturned,
                (SELECT COALESCE(SUM(fine_amount), 0) 
                 FROM borrow_record 
                 WHERE fine_amount > 0 AND (fine_paid IS NULL OR fine_paid = 0)) AS pendingFines
        """;

        return jdbcTemplate.queryForMap(sql);
    }
}

