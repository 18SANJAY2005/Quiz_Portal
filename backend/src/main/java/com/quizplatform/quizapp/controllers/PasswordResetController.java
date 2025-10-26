package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.UserRepository;
import com.quizplatform.quizapp.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/request")
    public ResponseEntity<Map<String, String>> requestOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Find user by email
            User user = userRepository.findByEmail(email);
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "No account found with this email address");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Generate and send OTP
            String otp = otpService.generateAndSendOtp(email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent to your email address");
            response.put("email", email); // Return email for frontend

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error sending OTP: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        boolean isValid = otpService.verifyOtp(email, otp);
        
        Map<String, String> response = new HashMap<>();
        if (isValid) {
            response.put("message", "OTP verified successfully");
            response.put("verified", "true");
        } else {
            response.put("message", "Invalid or expired OTP");
            response.put("verified", "false");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        // Verify OTP first
        if (!otpService.verifyOtp(email, otp)) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Find user
        User user = userRepository.findByEmail(email);
        if (user == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark OTP as used
        otpService.markOtpAsUsed(email, otp);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }
}

