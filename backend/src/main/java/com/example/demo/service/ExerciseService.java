package com.example.demo.service;

import com.example.demo.model.Exercise;
import com.example.demo.repository.ExerciseRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public Exercise createExercise(Exercise exercise) {
        validateExercise(exercise);
        return exerciseRepository.save(exercise);
    }

    public List<Exercise> getAllExercises(int page, int size) {
        return getAllExercises(page, size, null, null, null, null);
    }

    public List<Exercise> getAllExercises(int page, int size, String name, String muscle, Integer minWeight, Integer maxWeight) {
        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException("Page must be >= 0 and size must be > 0");
        }

        Specification<Exercise> spec = (root, query, cb) -> cb.conjunction();
        if (name != null && !name.isBlank()) {
            String lowered = name.toLowerCase();
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + lowered + "%"));
        }
        if (muscle != null && !muscle.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("muscle")), muscle.toLowerCase()));
        }
        if (minWeight != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("weight"), minWeight));
        }
        if (maxWeight != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("weight"), maxWeight));
        }

        List<Exercise> filtered = exerciseRepository.findAll(spec);
        int offset = page * size;
        if (offset >= filtered.size()) {
            return List.of();
        }
        int toIndex = Math.min(offset + size, filtered.size());
        return filtered.subList(offset, toIndex);
    }

    public Optional<Exercise> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    @Transactional
    public Exercise updateExercise(Long id, Exercise updatedExercise) {
        validateExercise(updatedExercise);

        Exercise existing = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found!"));

        existing.setName(updatedExercise.getName());
        existing.setMuscle(updatedExercise.getMuscle());
        existing.setDescription(updatedExercise.getDescription());
        existing.setWeight(updatedExercise.getWeight());
        existing.setReps(updatedExercise.getReps());
        existing.setSets(updatedExercise.getSets());
        existing.setDuration(updatedExercise.getDuration());
        existing.setCreatedBy(updatedExercise.getCreatedBy());

        return exerciseRepository.save(existing);
    }

    @Transactional
    public boolean deleteExercise(Long id) {
        if (!exerciseRepository.existsById(id)) {
            return false;
        }
        exerciseRepository.deleteById(id);
        return true;
    }

    public long getTotalExercises() {
        return exerciseRepository.count();
    }

    public Map<String, Object> getExerciseStats() {
        List<Exercise> all = exerciseRepository.findAll();
        long total = all.size();
        double averageWeight = total == 0 ? 0.0 : all.stream().mapToInt(Exercise::getWeight).average().orElse(0.0);
        double averageDuration = total == 0 ? 0.0 : all.stream().mapToInt(Exercise::getDuration).average().orElse(0.0);

        Map<String, Long> byMuscle = new HashMap<>();
        for (Object[] row : exerciseRepository.countByMuscleGroup()) {
            byMuscle.put((String) row[0], (Long) row[1]);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExercises", total);
        stats.put("averageWeight", averageWeight);
        stats.put("averageDuration", averageDuration);
        stats.put("countByMuscle", byMuscle);
        return stats;
    }

    @Transactional
    public void clearAll() {
        exerciseRepository.deleteAll();
    }

    private void validateExercise(Exercise exercise) {
        if (exercise.getName() == null || exercise.getName().isBlank()) {
            throw new IllegalArgumentException("Exercise name is mandatory!");
        }
        if (exercise.getMuscle() == null || exercise.getMuscle().isBlank()) {
            throw new IllegalArgumentException("Muscle group is mandatory!");
        }
        if (exercise.getDuration() <= 0) {
            throw new IllegalArgumentException("Duration must be positive!");
        }
        if (exercise.getReps() <= 0 || exercise.getSets() <= 0) {
            throw new IllegalArgumentException("Reps and sets must be positive!");
        }
        if (exercise.getWeight() < 0) {
            throw new IllegalArgumentException("Weight must be non-negative!");
        }
    }
}

