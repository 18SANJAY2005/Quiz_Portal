package com.quizplatform.quizapp.repository;

import com.quizplatform.quizapp.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuizRepository extends MongoRepository<Quiz, String> {
}