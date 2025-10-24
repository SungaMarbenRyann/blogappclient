import React, { useState } from 'react';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = async () => {
    const res = await fetch('https://blogappserver-mnrz.onrender.com/api/auth/register', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username, email, password })
    });
    const json = await res.json();
    if(res.ok) {
      onRegister(json.token);
      alert('Registered and logged in');
    } else {
      alert(json.message || 'Register failed');
    }
  };
  return (
    <div className="card p-4" style={{maxWidth:420}}>
      <h3>Register</h3>
      <input className="form-control mb-2" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input className="form-control mb-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="form-control mb-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn btn-orange" onClick={submit}>Register</button>
    </div>
  );
}
