package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @NotBlank(message = "Exercise name is mandatory!")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Muscle group is mandatory!")
    @Column(nullable = false)
    private String muscle;

    private String description;

    @Min(value = 0, message = "Weight must be >= 0")
    @Column(nullable = false)
    private int weight;

    @Min(value = 1, message = "Reps must be >= 1")
    @Column(nullable = false)
    private int reps;

    @Min(value = 1, message = "Sets must be >= 1")
    @Column(nullable = false)
    private int sets;

    @Min(value = 1, message = "Duration must be >= 1")
    @Column(nullable = false)
    private int duration;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Exercise() {}

    public Exercise(Long id, String name, String description, int duration) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.muscle = "Other";
        this.weight = 0;
        this.reps = 1;
        this.sets = 1;
        this.duration = duration;
    }

    public Exercise(Long id, Long createdByUserId, String name, String muscle, int weight, int reps, int sets) {
        this.id = id;
        this.name = name;
        this.muscle = muscle;
        this.weight = weight;
        this.reps = reps;
        this.sets = sets;
        this.duration = reps * sets;
        if (createdByUserId != null) {
            User user = new User();
            user.setId(createdByUserId);
            this.createdBy = user;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMuscle() {
        return muscle;
    }

    public void setMuscle(String muscle) {
        this.muscle = muscle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public int getReps() {
        return reps;
    }

    public void setReps(int reps) {
        this.reps = reps;
    }

    public int getSets() {
        return sets;
    }

    public void setSets(int sets) {
        this.sets = sets;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
