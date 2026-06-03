package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Database Statistics and Filters
 * Demonstrates Stored Procedures for:
 * - Statistics (COUNT, AVG, MIN, MAX)
 * - Filters (by muscle group, by user)
 * - Triggers (audit log)
 */
@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * GET /api/stats/exercise-statistics
     * Returns: Total exercises, avg weight, max weight, etc.
     * Uses: sp_get_exercise_stats stored procedure
     */
    @GetMapping("/exercise-statistics")
    public Map<String, Object> getExerciseStatistics() {
        List<Map<String, Object>> results = jdbcTemplate.queryForList(
            "EXEC sp_get_exercise_stats"
        );
        return results.isEmpty() ? Map.of() : results.get(0);
    }

    /**
     * GET /api/stats/exercises-by-muscle/{muscle}
     * FILTER: Get all exercises for a specific muscle group
     * Example: /api/stats/exercises-by-muscle/Chest
     */
    @GetMapping("/exercises-by-muscle/{muscle}")
    public List<Map<String, Object>> getExercisesByMuscle(@PathVariable String muscle) {
        return jdbcTemplate.queryForList(
            "EXEC sp_get_exercises_by_muscle @muscle = ?",
            muscle
        );
    }

    /**
     * GET /api/stats/user/{userId}/exercises
     * FILTER: Get all exercises created by a specific user
     * Example: /api/stats/user/1/exercises
     */
    @GetMapping("/user/{userId}/exercises")
    public List<Map<String, Object>> getUserExercises(@PathVariable Long userId) {
        return jdbcTemplate.queryForList(
            "EXEC sp_get_user_exercises @user_id = ?",
            userId
        );
    }

    /**
     * GET /api/stats/audit-log
     * Returns all changes made to users and exercises (from triggers)
     * Demonstrates: TRIGGERS - Audit logging for data integrity
     */
    @GetMapping("/audit-log")
    public List<Map<String, Object>> getAuditLog() {
        return jdbcTemplate.queryForList(
            "SELECT * FROM audit_log ORDER BY changed_at DESC"
        );
    }

    /**
     * GET /api/stats/audit-log/{tableName}
     * Get audit log for a specific table (users or exercises)
     */
    @GetMapping("/audit-log/{tableName}")
    public List<Map<String, Object>> getAuditLogByTable(@PathVariable String tableName) {
        return jdbcTemplate.queryForList(
            "SELECT * FROM audit_log WHERE table_name = ? ORDER BY changed_at DESC",
            tableName
        );
    }

    /**
     * GET /api/stats/database-info
     * Returns database normalization and structure info
     */
    @GetMapping("/database-info")
    public Map<String, Object> getDatabaseInfo() {
        return Map.of(
            "normalization", "3NF (Third Normal Form)",
            "tables", List.of(
                Map.of(
                    "name", "users",
                    "purpose", "Store user information",
                    "pk", "id",
                    "uniqueness", "email is UNIQUE"
                ),
                Map.of(
                    "name", "exercises",
                    "purpose", "Store exercises with FK to users",
                    "fk", "created_by_user_id -> users.id",
                    "indexes", new String[]{"muscle", "created_by_user_id"}
                ),
                Map.of(
                    "name", "audit_log",
                    "purpose", "Track all changes via triggers",
                    "operations", new String[]{"INSERT", "UPDATE", "DELETE"}
                )
            ),
            "features", List.of(
                "✅ Relational design (Foreign Keys)",
                "✅ No data duplication (3NF)",
                "✅ CRUD Stored Procedures",
                "✅ Statistical functions",
                "✅ Filters by muscle & user",
                "✅ Audit triggers for compliance",
                "✅ Indexes for performance"
            )
        );
    }
}

