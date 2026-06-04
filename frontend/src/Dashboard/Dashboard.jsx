import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const API_BASES = [import.meta.env.VITE_API_BASE || '/api'];

const apiRequest = async (path, options = {}) => {
    let lastError = null;
    let lastResponse = null;

    // Add JWT token to headers
    const token = localStorage.getItem('jwt_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    for (const base of API_BASES) {
        if (!base) {
            continue;
        }

        try {
            const res = await fetch(`${base}${path}`, {
                ...options,
                headers,
            });
            lastResponse = res;
            if (res.status !== 404) {
                return res;
            }
        } catch (err) {
            lastError = err;
        }
    }

    if (lastResponse) {
        return lastResponse;
    }
    throw lastError || new Error('No backend response');
};

const getExerciseOwnerId = (exercise) => {
    // În imaginea ta, structura este exercise.createdBy.id
    if (exercise && exercise.createdBy && exercise.createdBy.id != null) {
        return Number(exercise.createdBy.id);
    }
    // Backup pentru alte variante
    if (exercise?.createdByUserId != null) return Number(exercise.createdByUserId);
    if (exercise?.userId != null) return Number(exercise.userId);

    return null;
};

function Dashboard({ exercises, setExercises }) {
    const navigate = useNavigate();
    const [newExercise, setNewExercise] = useState({ name: '', muscle: '', sets: '', reps: '', weight: 60 });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Încarcă exercițiile din backend la montare
    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('jwt_token');
            console.log("%c[DEBUG] User ID:", "color: #ccff00", userId);
            console.log("%c[DEBUG] JWT Token exists:", "color: #ccff00", !!token);

            if (!userId || !token) {
                console.warn("[DEBUG] Missing user_id or JWT token. Redirecting to login...");
                setExercises([]);
                navigate('/login', { replace: true });
                return;
            }

            // Use apiRequest to get exercises with JWT
            const res = await apiRequest('/exercises?page=0&size=100');

            if (!res.ok) {
                console.error("[DEBUG] Backend Error:", res.status);
                const errorData = await res.json();
                console.error("[DEBUG] Error Data:", errorData);
                setExercises([]);
                return;
            }

            const data = await res.json();
            console.log("[DEBUG] Raw data from server:", data);

            const currentUserId = Number(userId);
            const allExercises = Array.isArray(data) ? data : [];

            // Filter exercises by current user
            const userExercises = allExercises.filter((ex) => {
                const ownerId = getExerciseOwnerId(ex);
                const isMatch = ownerId === currentUserId;

                console.log(
                    `Exercise: ${ex.name} | Owner ID: ${ownerId} | Looking for: ${currentUserId} | Match: ${isMatch}`
                );

                return isMatch;
            });

            console.log(`%c[DEBUG] Found ${userExercises.length} exercises for current user.`, "color: #ccff00; font-weight: bold");
            setExercises(userExercises);

        } catch (err) {
            console.error('[DEBUG] Fatal fetch error:', err);
            setExercises([]);
        }
    };

    // --- HELPER: Star Rating ---
    const StarRating = ({ rating }) => (
        <div className="star-container">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ color: star <= rating ? '#CCFF00' : '#444' }}>★</span>
            ))}
        </div>
    );

    // --- BAZINGA LOGIC: Plate Calculator ---
    // --- BAZINGA LOGIC: Doar discuri de 5kg+ ---
    const calculatePlates = (targetWeight) => {
        // Calculăm ce punem pe O SINGURĂ parte (scădem bara de 20kg și împărțim la 2)
        let remainingPerSide = (targetWeight - 20) / 2;

        if (remainingPerSide <= 0) return [];

        // Lista completă de discuri standard + mici
        const availablePlates = [
            { w: 20, color: '#EF4444', label: '20' },   // Roșu
            { w: 10, color: '#10B981', label: '10' },   // Verde
            { w: 5, color: '#FFFFFF', label: '5' },    // Alb
            { w: 2.5, color: '#3B82F6', label: '2.5' }, // Albastru
            { w: 1.25, color: '#F59E0B', label: '1.25' },// Galben
            { w: 1, color: '#999999', label: '1' }      // Gri (Micro)
        ];

        const result = [];
        availablePlates.forEach(plate => {
            while (remainingPerSide >= plate.w) {
                result.push(plate);
                remainingPerSide -= plate.w;
            }
        });
        return result;
    };

    const currentPlates = useMemo(() => calculatePlates(newExercise.weight || 20), [newExercise.weight]);

    // --- CRUD LOGIC ---
    const determineMuscleGroup = (exerciseName) => {
        const lowerName = exerciseName.toLowerCase();
        if (lowerName.includes('bicep')) return 'Biceps';
        if (lowerName.includes('tricep')) return 'Triceps';
        if (lowerName.includes('shoulder')) return 'Shoulders';
        if (lowerName.includes('leg')) return 'Legs';
        if (lowerName.includes('bench') || lowerName.includes('press')) return 'Chest';
        if (lowerName.includes('squat') || lowerName.includes('leg')) return 'Legs';
        if (lowerName.includes('deadlift') || lowerName.includes('back')) return 'Back';
        return 'Other';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newExercise.name) return alert("Exercise name is required!");

        const muscleGroup = determineMuscleGroup(newExercise.name);
        const userId = Number(localStorage.getItem('user_id'));
        if (!userId) {
            alert('Session expired. Please login again.');
            navigate('/login', { replace: true });
            return;
        }

        try {
            if (editId) {
                // UPDATE exercise
                const res = await apiRequest(`/exercises/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newExercise.name,
                        muscle: muscleGroup,
                        weight: newExercise.weight,
                        reps: parseInt(newExercise.reps) || 0,
                        sets: parseInt(newExercise.sets) || 0,
                        duration: 20,
                        createdBy: { id: userId }
                    }),
                });
                if (res.ok) {
                    fetchExercises();
                    setEditId(null);
                    alert('Exercise updated!');
                } else {
                    const error = await res.json();
                    alert('Update failed: ' + (error.message || res.status));
                }
            } else {
                // CREATE new exercise
                const res = await apiRequest('/exercises', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newExercise.name,
                        muscle: muscleGroup,
                        weight: newExercise.weight,
                        reps: parseInt(newExercise.reps) || 0,
                        sets: parseInt(newExercise.sets) || 0,
                        duration: 20,
                        createdBy: { id: userId }
                    }),
                });
                if (res.ok) {
                    fetchExercises();
                    alert('Exercise added!');
                } else {
                    const error = await res.json();
                    alert('Create failed: ' + (error.message || res.status));
                }
            }
            setNewExercise({ name: '', muscle: '', sets: '', reps: '', weight: 60 });
        } catch (err) {
            console.error('Submit error:', err);
            alert('Save error: ' + err.message);
        }
    };

    const filtered = exercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const chartData = exercises.reduce((acc, ex) => {
        const found = acc.find(item => item.muscle === ex.muscle);
        if (found) found.count += 1;
        else acc.push({ muscle: ex.muscle, count: 1 });
        return acc;
    }, []);

    return (
        <div className="gold-dashboard-layout">
            <header className="dash-header">
                <h1 className="neon-text">NextRep</h1>
                <div className="search-wrapper">
                    <input type="text" placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </header>

            <div className="main-grid">
                {/* COLOANA STÂNGA: Formular + Tabel */}
                <section className="master-panel">
                    <form onSubmit={handleSubmit} className="gold-form">
                        <h3>{editId ? "🔧 Edit Exercise" : "➕ Add New"}</h3>
                        <div className="form-inputs">
                            <input type="text" placeholder="Name" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} />
                            <input type="number" placeholder="Sets" value={newExercise.sets} onChange={e => setNewExercise({...newExercise, sets: e.target.value})} />
                            <input type="number" placeholder="Weight (kg)" value={newExercise.weight} onChange={e => setNewExercise({...newExercise, weight: parseInt(e.target.value) || 0})} />
                            <input type="number" placeholder="Reps" value={newExercise.reps} onChange={e => setNewExercise({...newExercise, reps: e.target.value})} />
                        </div>
                        <button type="submit" className="gold-btn">{editId ? "Update" : "Save"}</button>
                    </form>

                    <div className="table-container">
                        <table className="gold-table">
                            <thead><tr><th>Exercise</th><th>Muscle</th><th>Weight</th><th>Actions</th></tr></thead>
                            <tbody>
                            <AnimatePresence mode="popLayout">
                                {currentItems.map(ex => (
                                    <motion.tr key={ex.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                        <td><strong>{ex.name}</strong></td>
                                        <td><span className="badge">{ex.muscle}</span></td>
                                        <td>{ex.weight} kg</td>
                                        <td className="actions">
                                             <Link to={`/exercise/${ex.id}`} className="view-link">View</Link>
                                             <button onClick={() => {setEditId(ex.id); setNewExercise(ex);}} className="edit-btn">Edit</button>
                                             <button onClick={async () => {
                                                 if (window.confirm('Ștergem exercițiul?')) {
                                                     try {
                                                          const res = await apiRequest(`/exercises/${ex.id}`, { method: 'DELETE' });
                                                         if (res.ok) {
                                                             fetchExercises();
                                                             alert('Exercițiu șters!');
                                                         }
                                                     } catch (err) {
                                                         console.error('Delete error:', err);
                                                     }
                                                 }
                                             }} className="delete-btn">Del</button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="gold-btn-small">Prev</button>
                        <span>{currentPage} / {totalPages || 1}</span>
                        <button disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="gold-btn-small">Next</button>
                    </div>
                </section>

                {/* COLOANA DREAPTĂ: Analytics + Bazinga */}
                <section className="stats-panel">
                    <div className="stats-card">
                        <h3>Muscle Distribution</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="muscle" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                                <Bar dataKey="count" fill="#ccff00" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="stats-card" style={{ marginTop: '20px' }}>
                        <h3>Difficulty Rating</h3>
                        <div className="difficulty-list">
                            {exercises.slice(0, 4).map(ex => (
                                <div key={ex.id} className="diff-item">
                                    <span>{ex.name}</span>
                                    <StarRating rating={ex.weight > 80 ? 5 : 4} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BAZINGA MUTAT ÎN DREAPTA */}
                    <div className="bazinga-card">
                        <div className="bazinga-header">
                            <h4>Barbell Loader</h4>
                            <span className="weight-display">{newExercise.weight} kg</span>
                        </div>
                        <div className="barbell-visual">
                            {/* Partea Stângă a barei */}
                            <div className="plates-stack left">
                                {currentPlates.map((p, i) => (
                                    <motion.div
                                        key={`left-${i}`}
                                        initial={{ scale: 0, x: 20 }}
                                        animate={{ scale: 1, x: 0 }}
                                        className="plate"
                                        style={{ backgroundColor: p.color, height: 40 + p.w * 2 }}
                                    >
                                        {p.label}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Axul barei (centru) */}
                            <div className="bar-shaft"></div>

                            {/* Partea Dreaptă a barei */}
                            <div className="plates-stack right">
                                {[...currentPlates].reverse().map((p, i) => (
                                    <motion.div
                                        key={`right-${i}`}
                                        initial={{ scale: 0, x: -20 }}
                                        animate={{ scale: 1, x: 0 }}
                                        className="plate"
                                        style={{ backgroundColor: p.color, height: 40 + p.w * 2 }}
                                    >
                                        {p.label}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Dashboard;