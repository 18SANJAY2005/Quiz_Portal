package com.quizplatform.quizapp.repository;

import com.quizplatform.quizapp.model.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResultRepository extends MongoRepository<Result, String> {
    Page<Result> findByUserId(String userId, Pageable pageable);
}