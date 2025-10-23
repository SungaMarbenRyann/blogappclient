import React, { useEffect, useState } from 'react';

export default function Admin({ token }) {
  const [posts, setPosts] = useState([]);
  useEffect(()=> {
    fetch('http://localhost:4000/api/posts').then(r=>r.json()).then(setPosts);
  }, []);

  const delPost = async (id) => {
    if(!token) return alert('Admin token required');
    const res = await fetch('http://localhost:4000/api/admin/posts/' + id, {
      method: 'DELETE', headers: { Authorization: 'Bearer ' + token }
    });
    if(res.ok) { alert('Deleted'); setPosts(posts.filter(p=>p._id !== id)); }
    else { const j=await res.json(); alert(j.message || 'Failed'); }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p className="text-muted">Note: set a user's <code>isAdmin</code> to true in the DB to enable admin actions.</p>
      <div className="list-group">
        {posts.map(p=>(
          <div key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{p.title}</strong><br/><small className="text-muted">by {p.author?.username}</small>
            </div>
            <div>
              <button className="btn btn-sm btn-danger" onClick={()=>delPost(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
