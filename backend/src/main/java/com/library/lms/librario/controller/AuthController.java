package com.library.lms.librario.controller;

import com.library.lms.librario.dto.ChangePasswordRequest;
import com.library.lms.librario.dto.LoginRequest;
import com.library.lms.librario.dto.RegisterRequest;
import com.library.lms.librario.dto.auth.ForgotPasswordRequest;
import com.library.lms.librario.dto.auth.VerifyOtpRequest;
import com.library.lms.librario.dto.auth.ResetPasswordRequest;
import com.library.lms.librario.entity.Role;
import com.library.lms.librario.entity.RoleName;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.RoleRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.ForgotPasswordService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private RoleRepository roleRepo;
    private final ForgotPasswordService forgotPasswordService;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    @Autowired private AuthenticationManager authManager;

    // ✅ Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        RoleName roleName = RoleName.MEMBER;
        if (req.getRole() != null && !req.getRole().isBlank()) {
            try {
                roleName = RoleName.valueOf(req.getRole().toUpperCase());
                if (roleName != RoleName.MEMBER) {
                    roleName = RoleName.MEMBER;
                }
            } catch (IllegalArgumentException ignored) {}
        }
        Role role = roleRepo.findByRoleName(roleName).orElseThrow();

        User u = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(role)
                .status(true)
                .build();

        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    // ✅ Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpRequest) {
        System.out.println("\n--- LOGIN ATTEMPT ---");
        System.out.println("Email provided: [" + req.getEmail() + "]");

        try {
            // 1. Directly fetch user from DB first
            User user = userRepo.findByEmail(req.getEmail()).orElse(null);
            
            if (user == null) {
                System.out.println("❌ User NOT FOUND in database for email: " + req.getEmail());
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials (User not found)"));
            }
            
            System.out.println("✅ User found in DB. ID: " + user.getId() + ", Role: " + user.getRole().getRoleName());
            
            // 2. Safely verify password using BCrypt
            boolean passwordMatches = encoder.matches(req.getPassword(), user.getPassword());
            System.out.println("✅ Manual BCrypt Match Result:     " + passwordMatches);
            System.out.println("Stored DB Hash Length:            " + (user.getPassword() != null ? user.getPassword().length() : "null"));
            System.out.println("Input Password Length:            " + (req.getPassword() != null ? req.getPassword().length() : "null"));

            if (!passwordMatches) {
                System.out.println("❌ Password does not match!");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }

            // 3. Fallback to manual authentication context if BCrypt matched correctly.
            // This prevents obscure Spring Security AuthenticationManager misconfigurations from blocking valid logins
            GrantedAuthority authority = new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName().name());
            Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword(), java.util.List.of(authority));

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, context);

            System.out.println("✅ Authentication Context Set successfully!");

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "sessionId", session.getId(),
                    "email", user.getEmail(),
                    "role", user.getRole().getRoleName().name(), // return role properly
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName()
                    )
            ));
        } catch (Exception ex) {
            System.out.println("❌ Error during login: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    // ✅ Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    // ✅ Forgot password → Send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgot(@Valid @RequestBody ForgotPasswordRequest req) {
        forgotPasswordService.startForgotPassword(req);
        return ResponseEntity.ok(Map.of("message", "OTP sent to email"));
    }

    // ✅ Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyOtpRequest req) {
        forgotPasswordService.verifyOtp(req);
        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    // ✅ Reset password
    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@Valid @RequestBody ResetPasswordRequest req) {
        forgotPasswordService.resetPassword(req);
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    // ✅ Change password for logged-in user
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }

        String email = auth.getName();
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!encoder.matches(req.getOldPassword(), u.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Old password is incorrect"));
        }

        u.setPassword(encoder.encode(req.getNewPassword()));
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "Password changed"));
    }
}
