package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String message = userService.registerUser(user);
        if (message.equals("User registered successfully")) {
            return ResponseEntity.ok(message);
        }
        return ResponseEntity.badRequest().body(message);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user, HttpSession session) {
        User existing = userService.loginUser(user.getUsername(), user.getPassword());
        if (existing != null) {
            session.setAttribute("user", existing);
            return ResponseEntity.ok(existing);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/current")
    public ResponseEntity<User> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}