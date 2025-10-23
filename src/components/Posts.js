import React, { useEffect, useState, useRef } from 'react';

export default function Posts({ onOpen, token, role }) {
    const [posts, setPosts] = useState([]);
    const [showNewPost, setShowNewPost] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/api/posts')
            .then(r => r.json())
            .then(setPosts)
            .catch(e => console.error(e));
    }, []);

    const canCreate = Boolean(token) && role !== 'admin';

    const handleCreated = async () => {
        await fetchPosts(setPosts);
        setShowNewPost(false);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>All Posts</h2>

                {/* Show "New Post" only for logged-in, non-admin users */}
                {canCreate && (
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPost(true)}
                    >
                        New Post
                    </button>
                )}
            </div>

            <div className="row">
                {posts.map(p => (
                    <div key={p._id} className="col-md-6 mb-3">
                        <div className="card card-accent">
                            <div className="card-body">
                                <h5 className="post-title">{p.title}</h5>
                                <p className="post-meta">
                                    By: {p.author?.username || 'Unknown'} — {new Date(p.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-truncate" style={{ maxHeight: '3.6em' }}>{p.content}</p>
                                <button className="btn btn-sm btn-orange" onClick={() => onOpen(p._id)}>Read more</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for creating a post */}
            {canCreate && (
                <CreatePostModal
                    open={showNewPost}
                    onClose={() => setShowNewPost(false)}
                    token={token}
                    role={role}
                    onCreate={handleCreated}
                />
            )}
        </div>
    );
}

function fetchPosts(setPosts){
    return fetch('http://localhost:4000/api/posts')
        .then(r => r.json())
        .then(setPosts)
        .catch(console.error);
}

/* ---------- Reusable Modal (no Bootstrap JS needed) ---------- */
function Modal({ open, onClose, title, children, footer }) {
    const dialogRef = useRef(null);

    // Close on ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    if (!open) return null;

    const backdropStyle = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050
    };
    const dialogStyle = { maxWidth: 600, width: '100%', margin: '0 16px' };

    const onBackdropClick = (e) => {
        // only close if clicking directly on backdrop, not inside dialog
        if (e.target === e.currentTarget) onClose?.();
    };

    return (
        <div style={backdropStyle} onMouseDown={onBackdropClick} role="dialog" aria-modal="true" aria-label={title}>
            <div className="card shadow" style={dialogStyle} ref={dialogRef}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>{title}</strong>
                    <button type="button" className="btn-close" aria-label="Close" onClick={onClose}/>
                </div>
                <div className="card-body">
                    {children}
                </div>
                {footer && (
                    <div className="card-footer d-flex justify-content-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------- CreatePost Modal ---------- */
function CreatePostModal({ open, onClose, token, role, onCreate }) {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [saving, setSaving] = React.useState(false);

    const submit = async () => {
        if (!token) return alert('Login required to create posts');
        if (role === 'admin') return alert('Admins are not allowed to create posts');
        if (!title.trim() || !content.trim()) return alert('Title and content are required');

        try {
            setSaving(true);
            const res = await fetch('http://localhost:4000/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ title, content })
            });
            if (res.ok) {
                setTitle(''); setContent('');
                await onCreate?.();
            } else {
                const j = await res.json().catch(() => ({}));
                alert(j.message || 'Error creating post');
            }
        } finally {
            setSaving(false);
        }
    };

    const footer = (
        <>
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-orange" onClick={submit} disabled={saving}>
                {saving ? 'Creating…' : 'Create'}
            </button>
        </>
    );

    return (
        <Modal open={open} onClose={onClose} title="New Post" footer={footer}>
            <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                    className="form-control"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>
            <div className="mb-0">
                <label className="form-label">Content</label>
                <textarea
                    className="form-control"
                    rows={5}
                    placeholder="Write your post..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>
        </Modal>
    );
}
