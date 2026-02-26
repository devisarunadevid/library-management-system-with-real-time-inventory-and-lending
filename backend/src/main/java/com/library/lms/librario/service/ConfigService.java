package com.library.lms.librario.service;

import com.library.lms.librario.entity.Config;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.ConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ConfigService {

    private final ConfigRepository configRepository;

    /** Get generic config value by key, return default if missing */
    public String getConfigValue(String key, String defaultValue) {
        return configRepository.findById(key)
                .orElse(new Config(key, defaultValue))
                .getValue();
    }

    /** Fine per day for overdue books */
    public BigDecimal getFinePerDay() {
        return new BigDecimal(getConfigValue("finePerDay", "10"));
    }

    /** Fine for damaged books */
    public BigDecimal getDamageFine() {
        return new BigDecimal(getConfigValue("fineDamage", "200"));
    }

    /** Fine for lost books */
    public BigDecimal getLostFine() {
        return new BigDecimal(getConfigValue("fineLost", "500"));
    }
}
