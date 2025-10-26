package com.quizplatform.quizapp.repository;

import com.quizplatform.quizapp.model.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfileRepository extends MongoRepository<Profile, String> {
    Profile findByUserId(String userId);
}

