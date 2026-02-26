package com.library.lms.librario.service;


import org.springframework.stereotype.Service;  // ✅ Import for @Service
import java.util.Map;                       // ✅ Import Map
import java.util.HashMap;                   // ✅ Import HashMap

@Service
public class OtpService {
    private final Map<String, String> otpStorage = new HashMap<>();

    public void storeOtp(String email, String otp) {
        otpStorage.put(email, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        return otpStorage.containsKey(email) && otpStorage.get(email).equals(otp);
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
    }
}
