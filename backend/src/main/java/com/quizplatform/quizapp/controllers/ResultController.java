package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.Result;
import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.ResultRepository;
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

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultRepository resultRepository;

    @PostMapping("/submit")
    public ResponseEntity<String> submitResult(@RequestBody Result result, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
        }
        result.setUserId(user.getId());
        resultRepository.save(result);
        return ResponseEntity.ok("Result submitted successfully");
    }

    @GetMapping("/my-results")
    public ResponseEntity<Map<String, Object>> getMyResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Result> resultPage = resultRepository.findByUserId(user.getId(), pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", resultPage.getContent());
        response.put("currentPage", resultPage.getNumber());
        response.put("totalItems", resultPage.getTotalElements());
        response.put("totalPages", resultPage.getTotalPages());
        response.put("hasNext", resultPage.hasNext());
        response.put("hasPrevious", resultPage.hasPrevious());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllResults(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Result> resultPage = resultRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("results", resultPage.getContent());
        response.put("currentPage", resultPage.getNumber());
        response.put("totalItems", resultPage.getTotalElements());
        response.put("totalPages", resultPage.getTotalPages());
        response.put("hasNext", resultPage.hasNext());
        response.put("hasPrevious", resultPage.hasPrevious());
        
        return ResponseEntity.ok(response);
    }
}