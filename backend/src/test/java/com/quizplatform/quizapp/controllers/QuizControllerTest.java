package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.Quiz;
import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpSession;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizControllerTest {

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private QuizController quizController;

    private MockHttpSession session;
    private User adminUser;
    private User studentUser;
    private Quiz testQuiz;

    @BeforeEach
    void setUp() {
        session = new MockHttpSession();
        
        adminUser = new User();
        adminUser.setId("1");
        adminUser.setUsername("admin");
        adminUser.setRole("ADMIN");

        studentUser = new User();
        studentUser.setId("2");
        studentUser.setUsername("student");
        studentUser.setRole("STUDENT");

        testQuiz = new Quiz();
        testQuiz.setId("quiz1");
        testQuiz.setTitle("Test Quiz");
    }

    @Test
    void testGetQuizzes_ReturnsPaginatedResults() {
        // Given
        List<Quiz> quizzes = Arrays.asList(testQuiz);
        Page<Quiz> page = new PageImpl<>(quizzes, PageRequest.of(0, 10), 1);
        
        when(quizRepository.findAll(any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Map<String, Object>> response = 
            (ResponseEntity<Map<String, Object>>) quizController.getQuizzes(0, 10, "title");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertTrue(body.containsKey("quizzes"));
        assertTrue(body.containsKey("currentPage"));
        assertTrue(body.containsKey("totalPages"));
    }

    @Test
    void testCreateQuiz_Authorized() {
        // Given
        session.setAttribute("user", adminUser);
        when(quizRepository.save(any(Quiz.class))).thenReturn(testQuiz);

        // When
        ResponseEntity<String> response = quizController.createQuiz(testQuiz, session);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Quiz created successfully", response.getBody());
        verify(quizRepository, times(1)).save(any(Quiz.class));
    }

    @Test
    void testCreateQuiz_Unauthorized_NotLoggedIn() {
        // Given
        session.removeAttribute("user");

        // When
        ResponseEntity<String> response = quizController.createQuiz(testQuiz, session);

        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(quizRepository, never()).save(any(Quiz.class));
    }

    @Test
    void testCreateQuiz_Unauthorized_NotAdmin() {
        // Given
        session.setAttribute("user", studentUser);

        // When
        ResponseEntity<String> response = quizController.createQuiz(testQuiz, session);

        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(quizRepository, never()).save(any(Quiz.class));
    }

    @Test
    void testGetQuizById_Found() {
        // Given
        when(quizRepository.findById("quiz1")).thenReturn(Optional.of(testQuiz));

        // When
        ResponseEntity<Quiz> response = quizController.getQuizById("quiz1");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("quiz1", response.getBody().getId());
    }

    @Test
    void testGetQuizById_NotFound() {
        // Given
        when(quizRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When
        ResponseEntity<Quiz> response = quizController.getQuizById("nonexistent");

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetQuizzes_WithPagination() {
        // Given
        List<Quiz> quizzes = Arrays.asList(testQuiz);
        Page<Quiz> page = new PageImpl<>(quizzes, PageRequest.of(1, 10), 20);
        
        when(quizRepository.findAll(any(Pageable.class))).thenReturn(page);

        // When
        ResponseEntity<Map<String, Object>> response = 
            (ResponseEntity<Map<String, Object>>) quizController.getQuizzes(1, 10, "title");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals(1, body.get("currentPage"));
        assertEquals(20, body.get("totalItems"));
    }
}

