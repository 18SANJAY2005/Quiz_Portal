package com.quizplatform.quizapp.service;

import com.quizplatform.quizapp.model.Otp;
import com.quizplatform.quizapp.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 10;

    public String generateAndSendOtp(String email) {
        try {
            // Generate 6-digit OTP
            String otp = generateOtp();
            
            // Delete any existing OTP for this email
            Otp existingOtp = otpRepository.findByEmail(email);
            if (existingOtp != null) {
                otpRepository.delete(existingOtp);
            }
            
            // Create new OTP
            Otp newOtp = new Otp();
            newOtp.setEmail(email);
            newOtp.setCode(otp);
            newOtp.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
            newOtp.setUsed(false);
            
            otpRepository.save(newOtp);
            
            // Send OTP via email
            emailService.sendOtpEmail(email, otp);
            
            return otp;
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP: " + e.getMessage(), e);
        }
    }

    public boolean verifyOtp(String email, String code) {
        Otp otp = otpRepository.findByEmailAndCode(email, code);
        
        if (otp == null) {
            return false;
        }
        
        // Check if OTP is used
        if (otp.isUsed()) {
            return false;
        }
        
        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otp.getExpiryTime())) {
            return false;
        }
        
        return true;
    }

    public void markOtpAsUsed(String email, String code) {
        Otp otp = otpRepository.findByEmailAndCode(email, code);
        if (otp != null) {
            otp.setUsed(true);
            otpRepository.save(otp);
        }
    }

    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }
}

