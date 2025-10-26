package com.quizplatform.quizapp.controllers;

import com.quizplatform.quizapp.model.Profile;
import com.quizplatform.quizapp.model.User;
import com.quizplatform.quizapp.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<Profile> getProfile(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Profile profile = profileRepository.findByUserId(user.getId());
        if (profile == null) {
            // Return empty profile if not found
            profile = new Profile();
            profile.setUserId(user.getId());
            profile.setEmail(user.getUsername()); // Default email to username
        }
        
        return ResponseEntity.ok(profile);
    }

    @PostMapping
    public ResponseEntity<String> saveProfile(@RequestBody Profile profile, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Profile existingProfile = profileRepository.findByUserId(user.getId());
        if (existingProfile != null) {
            profile.setId(existingProfile.getId());
        }
        
        profile.setUserId(user.getId());
        profileRepository.save(profile);
        return ResponseEntity.ok("Profile saved successfully");
    }

    @PutMapping
    public ResponseEntity<String> updateProfile(@RequestBody Profile profile, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Profile existingProfile = profileRepository.findByUserId(user.getId());
        if (existingProfile != null) {
            profile.setId(existingProfile.getId());
        }
        
        profile.setUserId(user.getId());
        profileRepository.save(profile);
        return ResponseEntity.ok("Profile updated successfully");
    }
}

