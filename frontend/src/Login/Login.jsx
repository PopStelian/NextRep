import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Importăm pentru Silver Challenge
import './Login.css';

const API_BASES = [import.meta.env.VITE_API_BASE || '/api'];

function Login({ onLogin }) { // Am adăugat onLogin ca prop pentru a comunica cu App.jsx
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Pentru Gold "Be Cool"
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const payload = { email: email.trim(), password };

        try {
            let res = null;
            let lastError = null;

            for (const base of API_BASES) {
                try {
                    // Nu încercăm de 2 ori același base dacă env-ul e identic cu fallback-ul.
                    if (!base) {
                        continue;
                    }

                    res = await fetch(`${base}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    // Dacă backend-ul răspunde (chiar și 401), ne oprim aici.
                    if (res.status !== 404) {
                        break;
                    }
                } catch (err) {
                    lastError = err;
                }
            }

            if (!res) {
                console.error('No backend response', lastError);
                alert('Server error. Verifica daca backend-ul ruleaza. Vezi consola pentru detalii.');
                return;
            }

            // Try to parse JSON safely
            let data = {};
            try {
                data = await res.json();
            } catch (parseErr) {
                console.warn('Response is not JSON', parseErr);
            }

            console.log('Login response', res.status, data);

             if (res.ok) {
                 if (!data?.user?.id) {
                     alert('Login response invalid: lipsește user id.');
                     return;
                 }
                 // Save JWT token and user data
                 if (data.token) {
                     localStorage.setItem('jwt_token', data.token);
                 }
                 localStorage.setItem('user_id', data.user.id.toString());
                 localStorage.setItem('user_name', data.user.name || '');
                 localStorage.setItem('user_email', data.user.email || '');

                 Cookies.set('last_logged_user', email, { expires: 7 });
                 alert(data.message || 'Login successful!');
                 if (onLogin) onLogin();
                 navigate('/home');
             } else {
                 alert(data.message || `Invalid credentials! (status ${res.status})`);
             }
        } catch (err) {
            console.error('Login error', err);
            alert('Server error. Verifica daca backend-ul ruleaza. Vezi consola pentru detalii.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-logo">NextRep</h1>
                <p className="login-subtitle">Sign in to continue</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="stelian@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="1234"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`sign-in-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                {Cookies.get('last_logged_user') && !isLoading && (
                    <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '15px' }}>
                        Not {Cookies.get('last_logged_user')}? Switch account.
                    </p>
                )}

                <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '15px', textAlign: 'center' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;