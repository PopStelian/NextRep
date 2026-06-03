package com.example.demo.repository;

import com.example.demo.model.Exercise;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long>, JpaSpecificationExecutor<Exercise> {

    @Query("select e.muscle, count(e) from Exercise e group by e.muscle")
    List<Object[]> countByMuscleGroup();

    // New method to find exercises by user
    List<Exercise> findByCreatedBy(User user);

    /**
     * Stored Procedure: Create Exercise
     */
    @Procedure(name = "sp_create_exercise")
    Long createExerciseProcedure(
        @Param("created_by_user_id") Long createdByUserId,
        @Param("name") String name,
        @Param("muscle") String muscle,
        @Param("description") String description,
        @Param("weight") Integer weight,
        @Param("reps") Integer reps,
        @Param("sets") Integer sets,
        @Param("duration") Integer duration
    );

    /**
     * Stored Procedure: Update Exercise
     */
    @Procedure(name = "sp_update_exercise")
    Integer updateExerciseProcedure(
        @Param("id") Long id,
        @Param("name") String name,
        @Param("muscle") String muscle,
        @Param("description") String description,
        @Param("weight") Integer weight,
        @Param("reps") Integer reps,
        @Param("sets") Integer sets,
        @Param("duration") Integer duration
    );

    /**
     * Stored Procedure: Delete Exercise
     */
    @Procedure(name = "sp_delete_exercise")
    Integer deleteExerciseProcedure(@Param("id") Long id);

    /**
     * Stored Procedure: Get Exercises by Muscle
     */
    @Procedure(name = "sp_get_exercises_by_muscle")
    List<Object[]> getExercisesByMuscleProcedure(@Param("muscle") String muscle);

    /**
     * Stored Procedure: Get User Exercises
     */
    @Procedure(name = "sp_get_user_exercises")
    List<Object[]> getUserExercisesProcedure(@Param("user_id") Long userId);
}
