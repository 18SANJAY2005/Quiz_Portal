package com.quizplatform.quizapp.repository;

import com.quizplatform.quizapp.model.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OtpRepository extends MongoRepository<Otp, String> {
    Otp findByEmail(String email);
    Otp findByEmailAndCode(String email, String code);
}

