package com.quizplatform.quizapp.config;

import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialize default admin account on application startup
 * Only creates the admin if it doesn't already exist
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin account if it doesn't exist
        if (userRepository.findByUsername("admin") == null) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); // Change this password!
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("=================================");
            System.out.println("Default admin account created:");
            System.out.println("Username: admin");
            System.out.println("Password: admin123");
            System.out.println("⚠️  CHANGE THE DEFAULT PASSWORD!");
            System.out.println("=================================");
        }
    }
}

