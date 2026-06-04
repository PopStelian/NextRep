import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Login from '../Login/Login';
import Register from '../Register/Register';
import Dashboard from '../Dashboard/Dashboard';
import ExerciseDetail from '../Exercise/ExerciseDetails';
import './App.css';

// Componenta Landing Page (Mutată aici sau importată)
const Home = () => {
    const handleLogout = () => {
        // Clear JWT and user data from localStorage
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        Cookies.remove('last_logged_user');
        window.location.href = '/login';
    };

    return (
        <div className="landing-page">
            <nav className="navbar">
                <div className="logo">NextRep</div>
                <div className="nav-links">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <header className="hero-section">
                <h1 className="hero-title">Track. Analyze. Grow.</h1>
                <p className="hero-description">
                    The ultimate fitness tracking platform designed to help you monitor your progress...
                </p>
                <Link to="/dashboard" className="btn-get-started">Get Started</Link>
            </header>

            <section className="features-grid">
                <div className="feature-card"><h3>🏋️‍♂️ Track Workouts</h3><p>Log every rep...</p></div>
                <div className="feature-card"><h3>📊 Analyze Data</h3><p>Visualize your progress...</p></div>
                <div className="feature-card"><h3>📈 Watch Growth</h3><p>Monitor your gains...</p></div>
            </section>
        </div>
    );
};

function App() {
    // Check JWT token from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem('jwt_token') && !!localStorage.getItem('user_id')
    );

    const [exercises, setExercises] = useState([]);

    // Session timeout: 30 minutes of inactivity
    useEffect(() => {
        const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
        let timeoutId;

        const resetTimeout = () => {
            clearTimeout(timeoutId);
            if (isAuthenticated) {
                timeoutId = setTimeout(() => {
                    // Logout user on inactivity
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('user_name');
                    localStorage.removeItem('user_email');
                    setIsAuthenticated(false);
                    alert('Session expired due to inactivity. Please login again.');
                    window.location.href = '/login';
                }, inactivityTimeout);
            }
        };

        // Reset timeout on user activity
        window.addEventListener('click', resetTimeout);
        window.addEventListener('keypress', resetTimeout);
        window.addEventListener('mousemove', resetTimeout);

        resetTimeout();

        return () => {
            window.removeEventListener('click', resetTimeout);
            window.removeEventListener('keypress', resetTimeout);
            window.removeEventListener('mousemove', resetTimeout);
            clearTimeout(timeoutId);
        };
    }, [isAuthenticated]);

    // Funcție apelată de componenta Login după succes
    const handleLoginSuccess = () => {
        setIsAuthenticated(!!localStorage.getItem('jwt_token') && !!localStorage.getItem('user_id'));
    };

    return (
        <Router>
            <Routes>
                {/* 0. Register page */}
                <Route
                    path="/register"
                    element={!isAuthenticated ? <Register onRegister={handleLoginSuccess} /> : <Navigate to="/home" />}
                />

                {/* 1. Prima pagină este acum LOGIN */}
                <Route
                    path="/login"
                    element={!isAuthenticated ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/home" />}
                />

                {/* 2. După Login, ajungi la HOME (Landing Page) */}
                <Route
                    path="/home"
                    element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
                />

                {/* 3. Din Home, apeși "Get Started" și ajungi la DASHBOARD */}
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard exercises={exercises} setExercises={setExercises} /> : <Navigate to="/login" />}
                />

                <Route
                    path="/exercise/:id"
                    element={isAuthenticated ? <ExerciseDetail exercises={exercises} /> : <Navigate to="/login" />}
                />

                {/* Redirect implicit */}
                <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;