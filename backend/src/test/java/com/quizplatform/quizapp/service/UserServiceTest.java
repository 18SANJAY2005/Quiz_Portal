package com.quizplatform.quizapp.service;

import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("test@example.com");
        testUser.setRole("STUDENT");
    }

    @Test
    void testRegisterUser_Success() {
        // Given
        when(userRepository.findByUsername(anyString())).thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        String result = userService.registerUser(testUser);

        // Then
        assertEquals("User registered successfully", result);
        verify(userRepository, times(1)).save(any(User.class));
        verify(passwordEncoder, times(1)).encode("password123");
    }

    @Test
    void testRegisterUser_UserAlreadyExists() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(testUser);

        // When
        String result = userService.registerUser(testUser);

        // Then
        assertEquals("User already exists", result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_EmailAlreadyExists() {
        // Given
        when(userRepository.findByUsername(anyString())).thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(testUser);

        // When
        String result = userService.registerUser(testUser);

        // Then
        assertEquals("Email already registered", result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_CannotRegisterAsAdmin() {
        // Given
        User adminUser = new User();
        adminUser.setUsername("adminuser");
        adminUser.setPassword("password");
        adminUser.setRole("ADMIN");
        
        when(userRepository.findByUsername(anyString())).thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(null);

        // When
        String result = userService.registerUser(adminUser);

        // Then
        assertEquals("Cannot register as admin", result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_ForcesStudentRole() {
        // Given
        User userNoRole = new User();
        userNoRole.setUsername("newuser");
        userNoRole.setPassword("password123");
        userNoRole.setEmail("new@example.com");
        userNoRole.setRole(null);
        
        when(userRepository.findByUsername(anyString())).thenReturn(null);
        when(userRepository.findByEmail(anyString())).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertEquals("STUDENT", saved.getRole());
            return saved;
        });

        // When
        userService.registerUser(userNoRole);

        // Then
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testLoginUser_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
        testUser.setPassword("encoded_password");

        // When
        User result = userService.loginUser("testuser", "password123");

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(passwordEncoder, times(1)).matches("password123", "encoded_password");
    }

    @Test
    void testLoginUser_InvalidPassword() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(testUser);
        when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);
        testUser.setPassword("encoded_password");

        // When
        User result = userService.loginUser("testuser", "wrongpassword");

        // Then
        assertNull(result);
    }

    @Test
    void testLoginUser_UserNotFound() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(null);

        // When
        User result = userService.loginUser("nonexistent", "password");

        // Then
        assertNull(result);
    }

    @Test
    void testFindByUsername() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(testUser);

        // When
        User result = userService.findByUsername("testuser");

        // Then
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
    }
}

