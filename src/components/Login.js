import React, { useState } from 'react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const submit = async () => {
        const res = await fetch('https://blogappserver-mnrz.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ email, password })
        });

        const json = await res.json();

        if (res.ok) {
            // Pass token + isAdmin to App
            onLogin(json.token, json.user.isAdmin ? 'admin' : 'user');
            alert('Logged in');
        } else {
            alert(json.message || 'Login failed');
        }
    };

    return (
        <div className="card p-4" style={{ maxWidth: 420 }}>
            <h3>Login</h3>
            <input
                className="form-control mb-2"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                className="form-control mb-2"
                placeholder="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button className="btn btn-orange" onClick={submit}>Login</button>
        </div>
    );
}
