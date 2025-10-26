package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.Quiz;
import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Quiz> quizPage = quizRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("quizzes", quizPage.getContent());
        response.put("currentPage", quizPage.getNumber());
        response.put("totalItems", quizPage.getTotalElements());
        response.put("totalPages", quizPage.getTotalPages());
        response.put("hasNext", quizPage.hasNext());
        response.put("hasPrevious", quizPage.hasPrevious());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        Optional<Quiz> quiz = quizRepository.findById(id);
        return quiz.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<String> createQuiz(@RequestBody Quiz quiz, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Only admin can create quiz");
        }
        quizRepository.save(quiz);
        return ResponseEntity.ok("Quiz created successfully");
    }
}