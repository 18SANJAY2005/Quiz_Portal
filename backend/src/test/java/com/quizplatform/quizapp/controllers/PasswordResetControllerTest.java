package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.UserRepository;
import com.quizplatform.quizapp.service.OtpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetController passwordResetController;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("1");
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("old_encoded_password");
        testUser.setRole("STUDENT");
    }

    @Test
    void testRequestOtp_Success() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
        when(otpService.generateAndSendOtp("test@example.com")).thenReturn("123456");

        // When
        var response = passwordResetController.requestOtp(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().containsKey("message"));
        assertTrue(response.getBody().containsKey("email"));
        verify(otpService, times(1)).generateAndSendOtp("test@example.com");
    }

    @Test
    void testRequestOtp_UserNotFound() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "notfound@example.com");
        
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(null);

        // When
        var response = passwordResetController.requestOtp(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("No account found"));
    }

    @Test
    void testRequestOtp_EmptyEmail() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "");

        // When
        var response = passwordResetController.requestOtp(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testVerifyOtp_Valid() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("otp", "123456");
        
        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);

        // When
        var response = passwordResetController.verifyOtp(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("true", response.getBody().get("verified"));
    }

    @Test
    void testVerifyOtp_Invalid() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("otp", "wrong");
        
        when(otpService.verifyOtp("test@example.com", "wrong")).thenReturn(false);

        // When
        var response = passwordResetController.verifyOtp(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("false", response.getBody().get("verified"));
    }

    @Test
    void testResetPassword_Success() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("otp", "123456");
        request.put("newPassword", "newPassword123");

        when(otpService.verifyOtp("test@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
        when(passwordEncoder.encode("newPassword123")).thenReturn("new_encoded_password");

        // When
        var response = passwordResetController.resetPassword(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository, times(1)).save(any(User.class));
        verify(otpService, times(1)).markOtpAsUsed("test@example.com", "123456");
    }

    @Test
    void testResetPassword_InvalidOtp() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("otp", "wrong");
        request.put("newPassword", "newPassword123");
        
        when(otpService.verifyOtp("test@example.com", "wrong")).thenReturn(false);

        // When
        var response = passwordResetController.resetPassword(request);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testResetPassword_UserNotFound() {
        // Given
        Map<String, String> request = new HashMap<>();
        request.put("email", "notfound@example.com");
        request.put("otp", "123456");
        request.put("newPassword", "newPassword123");
        
        when(otpService.verifyOtp("notfound@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(null);

        // When
        var response = passwordResetController.resetPassword(request);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}

