package com.quizplatform.quizapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        if (mailSender != null) {
            // Email is configured - send actual email
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject("Password Reset OTP - Quiz Platform");
                message.setText(
                    "Hello,\n\n" +
                    "You requested a password reset for your quiz platform account.\n\n" +
                    "Your OTP code is: " + otp + "\n\n" +
                    "This code is valid for 10 minutes.\n\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Quiz Platform Team"
                );
                mailSender.send(message);
            } catch (Exception e) {
                // If email fails, log to console for development
                logOtpToConsole(toEmail, otp);
                throw new RuntimeException("Failed to send email: " + e.getMessage());
            }
        } else {
            // Email not configured - log to console for development
            logOtpToConsole(toEmail, otp);
        }
    }

    private void logOtpToConsole(String toEmail, String otp) {
        System.out.println("\n===========================================");
        System.out.println("📧 DEVELOPMENT MODE - EMAIL NOT CONFIGURED");
        System.out.println("===========================================");
        System.out.println("Email would be sent to: " + toEmail);
        System.out.println("OTP Code: " + otp);
        System.out.println("===========================================");
        System.out.println("⚠️  Configure email in application.properties");
        System.out.println("to send OTP via email in production");
        System.out.println("===========================================\n");
    }
}

