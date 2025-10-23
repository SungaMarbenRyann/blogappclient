import React, { useEffect, useState } from 'react';

export default function PostView({ postId, token, role, onBack }) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (!postId) return;
        fetch('http://localhost:4000/api/posts/' + postId)
            .then(r => r.json()).then(setPost);
        fetch('http://localhost:4000/api/comments/post/' + postId)
            .then(r => r.json()).then(setComments);
    }, [postId]);

    const addComment = async () => {
        if (!token) return alert('Please login to comment');
        const res = await fetch('http://localhost:4000/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ content: commentText, postId })
        });
        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            return alert(j.message || 'Failed to add comment');
        }
        setCommentText('');
        const r = await fetch('http://localhost:4000/api/comments/post/' + postId);
        setComments(await r.json());
    };

    const deleteCommentAsAdmin = async (commentId) => {
        if (role !== 'admin') return alert('Admins only');
        if (!token) return alert('Admin token required');
        if (!confirm('Delete this comment?')) return;

        const res = await fetch('http://localhost:4000/api/admin/comments/' + commentId, {
            method: 'DELETE',
            headers: { Authorization: 'Bearer ' + token }
        });
        if (res.ok) {
            // remove from local state without refetch
            setComments(prev => prev.filter(c => c._id !== commentId));
        } else {
            const j = await res.json().catch(()=>({}));
            alert(j.message || 'Failed to delete comment');
        }
    };

    if (!post) return <div>Loading...</div>;

    return (
        <div>
            <button className="btn btn-sm btn-outline-secondary mb-3" onClick={onBack}>← Back</button>

            <div className="card">
                <div className="card-body">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-meta">By {post.author?.username} • {new Date(post.createdAt).toLocaleString()}</p>
                    <div className="mt-3" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
                </div>
            </div>

            <div className="mt-4">
                <h5>Comments</h5>

                {comments.map(c => (
                    <div key={c._id} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-start">
                        <div>
                            <strong>{c.author?.username}</strong>{' '}
                            • <small className="text-muted">{new Date(c.createdAt).toLocaleString()}</small>
                            <div className="mt-1">{c.content}</div>
                        </div>

                        {/* Admin-only delete button */}
                        {role === 'admin' && (
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteCommentAsAdmin(c._id)}
                                title="Delete comment (admin)"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}

                <div className="mt-3">
          <textarea
              className="form-control mb-2"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder="Write a comment..."
          />
                    <button className="btn btn-orange" onClick={addComment}>Add Comment</button>
                </div>
            </div>
        </div>
    );
}
