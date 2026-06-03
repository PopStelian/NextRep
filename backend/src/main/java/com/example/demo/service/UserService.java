package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use!");
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers(int page, int size) {
        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException("Page must be >= 0 and size must be > 0");
        }
        int offset = page * size;
        List<User> users = userRepository.findAll();
        if (offset >= users.size()) {
            return List.of();
        }
        int toIndex = Math.min(offset + size, users.size());
        return users.subList(offset, toIndex);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        if (!existing.getEmail().equals(updatedUser.getEmail()) && userRepository.existsByEmail(updatedUser.getEmail())) {
            throw new IllegalArgumentException("Email already in use!");
        }

        existing.setName(updatedUser.getName());
        existing.setEmail(updatedUser.getEmail());
        existing.setPassword(updatedUser.getPassword());
        return userRepository.save(existing);
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public Map<String, Long> getUserStats() {
        long totalUsers = userRepository.count();
        long last24Hours = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusHours(24));
        return Map.of(
                "totalUsers", totalUsers,
                "registeredLast24Hours", last24Hours
        );
    }

    @Transactional
    public void clearAll() {
        userRepository.deleteAll();
    }
}

