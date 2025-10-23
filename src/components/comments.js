// components/Comments.jsx
import React, { useEffect, useState } from 'react';

export default function Comments({ postId, token, role }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/comments/post/${postId}`);
            const data = await res.json();
            setComments(data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [postId]);

    const add = async () => {
        if (!token) return alert('Login required to comment');
        if (!text.trim()) return;
        const res = await fetch('http://localhost:4000/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ postId, text })
        });
        if (res.ok) {
            setText('');
            load();
        } else {
            const j = await res.json().catch(()=>({}));
            alert(j.message || 'Failed to add comment');
        }
    };

    const delAsAdmin = async (id) => {
        if (role !== 'admin') return; // UI guard
        if (!token) return alert('Admin token required');
        if (!confirm('Delete this comment?')) return;

        const res = await fetch(`http://localhost:4000/api/admin/comments/${id}`, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
            setComments(prev => prev.filter(c => c._id !== id));
        } else {
            const j = await res.json().catch(()=>({}));
            alert(j.message || 'Failed to delete comment');
        }
    };

    return (
        <div className="mt-4">
            <h5>Comments</h5>

            {loading && <div className="text-muted">Loading comments…</div>}

            {!loading && comments.length === 0 && (
                <div className="text-muted">No comments yet.</div>
            )}

            <div className="list-group mb-3">
                {comments.map(c => (
                    <div key={c._id} className="list-group-item d-flex justify-content-between align-items-start">
                        <div className="me-2">
                            <div><strong>{c.author?.username || 'Anonymous'}</strong></div>
                            <div className="small text-muted">{new Date(c.createdAt).toLocaleString()}</div>
                            <div className="mt-1">{c.text}</div>
                        </div>
                        {/* Admin-only delete button */}
                        {role === 'admin' && (
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => delAsAdmin(c._id)}
                                title="Delete comment (admin)"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add comment (available to any logged-in user; optional for your rules) */}
            <div className="input-group">
                <input
                    className="form-control"
                    placeholder="Write a comment…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={!token}
                />
                <button className="btn btn-orange" onClick={add} disabled={!token}>
                    Post
                </button>
            </div>
            {!token && <div className="small text-muted mt-1">Login to comment.</div>}
        </div>
    );
}
