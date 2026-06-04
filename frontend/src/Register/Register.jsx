import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Login/Login.css'; // Reuse Login styles

const API_BASES = [import.meta.env.VITE_API_BASE || '/api'];

function Register({ onRegister }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validation
        if (!name.trim()) {
            setError('Name is required');
            setIsLoading(false);
            return;
        }

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            setIsLoading(false);
            return;
        }

        if (!email.trim()) {
            setError('Email is required');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        const payload = {
            name: name.trim(),
            email: email.trim(),
            password: password
        };

        try {
            let res = null;
            let lastError = null;

            for (const base of API_BASES) {
                try {
                    if (!base) {
                        continue;
                    }

                    res = await fetch(`${base}/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    if (res.status !== 404) {
                        break;
                    }
                } catch (err) {
                    lastError = err;
                }
            }

            if (!res) {
                console.error('No backend response', lastError);
                setError('Server error. Please check if the backend is running.');
                return;
            }

            let data = {};
            try {
                data = await res.json();
            } catch (parseErr) {
                console.warn('Response is not JSON', parseErr);
            }

            console.log('Register response', res.status, data);

             if (res.ok) {
                 // Save JWT token and user data on registration
                 if (data.token) {
                     localStorage.setItem('jwt_token', data.token);
                 }
                 if (data.user) {
                     localStorage.setItem('user_id', data.user.id.toString());
                     localStorage.setItem('user_name', data.user.name || '');
                     localStorage.setItem('user_email', data.user.email || '');
                 }

                 alert(data.message || 'Account created successfully!');
                 if (onRegister) onRegister();
                 navigate('/home');
             } else {
                 setError(data.message || `Registration failed! (status ${res.status})`);
             }
        } catch (err) {
            console.error('Register error', err);
            setError('Server error. Please check if the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-logo">NextRep</h1>
                <p className="login-subtitle">Create your account</p>

                {error && (
                    <div style={{
                        color: '#d32f2f',
                        backgroundColor: '#ffebee',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="stelian@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`sign-in-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '15px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

