import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ExerciseDetails.css';

const ExerciseDetail = ({ exercises }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Găsim exercițiul în lista din RAM după ID
    const exercise = exercises.find(ex => ex.id === parseInt(id));

    if (!exercise) {
        return <div className="detail-container"><h2>Exercițiul nu a fost găsit!</h2></div>;
    }

    return (
        <div className="detail-container">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>

            <div className="detail-card">
                <h1 className="neon-text">{exercise.name}</h1>
                <div className="detail-grid">
                    <div className="info-section">
                        <h3>Target Muscle: <span className="highlight">{exercise.muscle}</span></h3>
                        <p><strong>Sets:</strong> {exercise.sets}</p>
                        <p><strong>Reps:</strong> {exercise.reps}</p>
                        <hr />
                        <h4>Execution Guide:</h4>
                        <p>Perform the movement with a full range of motion. Maintain a stable core and breathe out during the exertion phase.</p>
                        <p><strong>Equipment:</strong> Standard Gym Equipment</p>
                    </div>
                    <div className="visual-section">
                        {/* Aici poți pune un placeholder sau o imagine generică */}
                        <div className="image-placeholder">
                            健身 (Workout Visual)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseDetail;