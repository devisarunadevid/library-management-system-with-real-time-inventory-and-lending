package com.library.lms.librario.service;

import com.library.lms.librario.dto.auth.ForgotPasswordRequest;
import com.library.lms.librario.dto.auth.ResetPasswordRequest;
import com.library.lms.librario.dto.auth.VerifyOtpRequest;
import com.library.lms.librario.model.OtpVerification;
import com.library.lms.librario.model.User;
import com.library.lms.librario.repository.OtpVerificationRepository;
import com.library.lms.librario.repository.UserRepository;
import com.library.lms.librario.service.mail.MailService;
import com.library.lms.librario.entity.enums.NotificationType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {
    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepo;
    private final MailService mailService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    private static final int OTP_TTL_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    @Transactional
    public void startForgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for email"));

        // Invalidate any active OTP
        otpRepo.findTopByUserAndConsumedFalseOrderByCreatedAtDesc(user).ifPresent(o -> {
            o.setConsumed(true);
            otpRepo.save(o);
        });

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        OtpVerification otpEntity = OtpVerification.builder()
                .user(user)
                .email(user.getEmail())
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES))
                .consumed(false)
                .verified(false)
                .attempts(0)
                .createdAt(LocalDateTime.now())
                .build();
        otpRepo.save(otpEntity);

        // ✅ Send Email
        String subject = "Your OTP for Password Reset";
        String body = "<p>Hello <b>" + (user.getName() == null ? "" : user.getName()) + "</b>,</p>" +
                "<p>Your One-Time Password (OTP) is:</p>" +
                "<h2 style='color:#2E86C1;'>" + otp + "</h2>" +
                "<p>This OTP will expire in <b>" + OTP_TTL_MINUTES + " minutes</b>.</p>" +
                "<p>If you did not request this, please ignore this email.</p>" +
                "<p><a href='http://your-frontend-url/reset-password' class='btn'>Reset Password</a></p>";
        mailService.send(user.getEmail(), subject, body);

        // ✅ In-App Notification (fixed)
        notificationService.create(user, "MEMBER", "Password Reset OTP Sent", NotificationType.GENERAL);
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for email"));

        OtpVerification otp = otpRepo.findTopByUserAndConsumedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalStateException("No active OTP. Please request a new one."));

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            otp.setConsumed(true);
            otpRepo.save(otp);
            throw new IllegalStateException("Too many attempts. OTP invalidated. Request a new OTP.");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otp.setConsumed(true);
            otpRepo.save(otp);
            throw new IllegalStateException("OTP expired. Request a new OTP.");
        }

        otp.setAttempts(otp.getAttempts() + 1);
        if (!otp.getOtp().equals(req.getOtp())) {
            otpRepo.save(otp);
            throw new IllegalArgumentException("Invalid OTP.");
        }

        // Mark verified by consuming it
        otp.setConsumed(true);
        otpRepo.save(otp);

        // ✅ In-App Notification (fixed)
        notificationService.create(user, "MEMBER", "OTP Verified successfully", NotificationType.GENERAL);

        // ✅ Email Confirmation
        mailService.send(user.getEmail(),
                "OTP Verified",
                "<p>Your OTP has been successfully verified. You can now reset your password.</p>");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        OtpVerification last = otpRepo.findTopByEmailOrderByCreatedAtDesc(req.getEmail())
                .orElseThrow(() -> new IllegalStateException("No OTP found. Verify OTP first."));

        if (!last.getOtp().equals(req.getOtp()))
            throw new IllegalArgumentException("Invalid OTP.");

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for email"));
        if (last.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new IllegalStateException("OTP expired. Request a new OTP.");

        if (!last.isConsumed())
            throw new IllegalStateException("Please verify OTP first.");

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // ✅ In-App Notification (fixed)
        notificationService.create(user, "MEMBER", "Your password has been changed successfully", NotificationType.GENERAL);

        // ✅ Email Confirmation
        mailService.send(user.getEmail(),
                "Password Reset Successful",
                "<p>Hello " + (user.getName() == null ? "" : user.getName()) + ",</p>" +
                        "<p>Your password has been changed successfully.</p>");
    }
}
