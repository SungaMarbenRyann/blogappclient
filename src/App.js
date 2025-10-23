import React, { useState } from 'react';
import Posts from './components/Posts';
import PostView from './components/PostView';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';

export default function App(){
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [view, setView] = useState('list');
    const [selectedPost, setSelectedPost] = useState(null);

    const onLogin = (token, role, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', userId);
        setToken(token);
        setRole(role);
        setUserId(userId);
        setView('list');
    };

    const onLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        setToken(null);
        setRole(null);
        setUserId(null);
        setView('list');
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg" style={{background:'#fff', borderBottom:'1px solid #e9e9e9'}}>
                <div className="container">
                    <a className="navbar-brand" href="#" onClick={e=>{e.preventDefault(); setView('list')}}>
                        Blog Application
                    </a>
                    <div>
                        <button className="btn btn-outline-secondary me-2" onClick={()=>setView('list')}>Posts</button>

                        {/* Show Register and Login only if NOT logged in */}
                        {!token && (
                            <>
                                <button className="btn btn-outline-secondary me-2" onClick={()=>setView('register')}>Register</button>
                                <button className="btn btn-outline-secondary me-2" onClick={()=>setView('login')}>Login</button>
                            </>
                        )}

                        {/* Admin only if role is admin */}
                        {role === 'admin' && (
                            <button className="btn btn-orange me-2" onClick={()=>setView('admin')}>Admin</button>
                        )}

                        {/* Logout only if logged in */}
                        {token && (
                            <button className="btn btn-sm btn-outline-danger" onClick={onLogout}>Logout</button>
                        )}
                    </div>
                </div>
            </nav>


            <main className="container mt-4">
                {view === 'list' && (
                    <Posts
                        onOpen={(p)=>{ setSelectedPost(p); setView('post'); }}
                        token={token}
                        role={role}
                        userId={userId}
                    />
                )}
                {view === 'post' && (
                    <PostView
                        postId={selectedPost}
                        token={token}
                        role={role}
                        userId={userId}
                        onBack={()=>setView('list')}
                    />
                )}
                {view === 'login' && <Login onLogin={onLogin} />}
                {view === 'register' && <Register onRegister={(t, r, u)=>onLogin(t, r, u)} />}
                {view === 'admin' && role === 'admin' && <Admin token={token} />}
                {view === 'admin' && role !== 'admin' && (
                    <div className="alert alert-warning">You don’t have access to the Admin Dashboard.</div>
                )}
            </main>

            <footer className="site-footer">
                <div className="container py-4">
                    <small>© {new Date().getFullYear()} OrangeGray Blog — Built with Bootstrap</small>
                </div>
            </footer>
        </div>
    );
}
