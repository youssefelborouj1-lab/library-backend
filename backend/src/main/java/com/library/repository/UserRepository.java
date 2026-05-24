package com.library.repository;

import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.role r WHERE r.id = 3 ORDER BY u.createdAt DESC")
    List<User> findAllUsers();

    @Query("SELECT u FROM User u JOIN FETCH u.role ORDER BY u.createdAt DESC")
    List<User> findAllWithRole();
}
