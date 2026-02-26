package com.library.lms.librario.config;

import com.library.lms.librario.entity.Role;
import com.library.lms.librario.entity.RoleName;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.RoleRepository;
import com.library.lms.librario.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration

public class DataInitializer {

    @Bean
    CommandLineRunner seedBaseData(RoleRepository roleRepo,
                                   UserRepository userRepo,
                                   PasswordEncoder encoder) {
        return args -> {
            // ✅ Seed roles if missing
            for (RoleName r : RoleName.values()) {
                roleRepo.findByRoleName(r).orElseGet(() ->
                        roleRepo.save(Role.builder().roleName(r).build()));
            }

            // ✅ Seed one admin if missing
            String adminEmail = "admin@librario.com";
            if (!userRepo.existsByEmail(adminEmail)) {
                Role adminRole = roleRepo.findByRoleName(RoleName.ADMIN).orElseThrow();
                User admin = User.builder()
                        .name("System Admin")
                        .email(adminEmail)
                        .password(encoder.encode("Admin@123")) // 🔑 default password
                        .role(adminRole)
                        .status(true)
                        .build();
                userRepo.save(admin);
            }
        };
    }
}
