package com.library.lms.librario.service;

import com.library.lms.librario.model.OtpVerification;
import com.library.lms.librario.repository.OtpVerificationRepository;
import com.library.lms.librario.service.mail.MailService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final MailService mailService;
    private final OtpVerificationRepository otpRepo;

    public AuthService(MailService mailService, OtpVerificationRepository otpRepo) {
        this.mailService = mailService;
        this.otpRepo = otpRepo;
    }

    // ✅ Send OTP
    public String sendOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        // Save OTP in DB
        OtpVerification otpEntity = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();
        otpRepo.save(otpEntity);

        // Send OTP email
        String body = "<p>Hello,</p>" +
                "<p>Your One-Time Password (OTP) for password reset is:</p>" +
                "<h2 style='color:#2E86C1; text-align:center; letter-spacing:3px;'>" + otp + "</h2>" +
                "<p>This OTP will expire in <b>10 minutes</b>.</p>" +
                "<p>If you did not request this, you can safely ignore this email.</p>" ;

        mailService.send(email, "Your OTP for Password Reset", body);

        return otp;
    }

    // ✅ Verify OTP
    public void verifyOtp(String email, String otp) {
        OtpVerification otpEntity = otpRepo.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("No OTP found for email"));

        if (!otpEntity.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        otpEntity.setVerified(true);
        otpRepo.save(otpEntity);
    }

    // ✅ Ensure OTP verified before reset
    public void ensureOtpVerified(String email) {
        boolean verified = otpRepo.findTopByEmailOrderByCreatedAtDesc(email)
                .map(OtpVerification::isVerified)
                .orElse(false);

        if (!verified) {
            throw new RuntimeException("OTP not verified for this email");
        }
    }
}
