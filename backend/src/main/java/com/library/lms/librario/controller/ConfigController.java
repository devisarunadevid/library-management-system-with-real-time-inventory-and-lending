package com.library.lms.librario.controller;


import com.library.lms.librario.service.ConfigService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    // ✅ GET fine per day
    @GetMapping("/fine")
    public double getFine() {
        return configService.getFinePerDay().doubleValue();
    }

}
