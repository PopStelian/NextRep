package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime since);
    
    /**
     * Stored Procedure: Create User
     */
    @Procedure(name = "sp_create_user")
    Long createUserProcedure(
        @Param("name") String name,
        @Param("email") String email,
        @Param("password") String password
    );
    
    /**
     * Stored Procedure: Update User
     */
    @Procedure(name = "sp_update_user")
    Integer updateUserProcedure(
        @Param("id") Long id,
        @Param("name") String name,
        @Param("email") String email,
        @Param("password") String password
    );
    
    /**
     * Stored Procedure: Delete User
     */
    @Procedure(name = "sp_delete_user")
    Integer deleteUserProcedure(@Param("id") Long id);
}
