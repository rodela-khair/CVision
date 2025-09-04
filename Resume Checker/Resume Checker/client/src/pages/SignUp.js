import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../styles/auth.css';

export default function SignUp() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'user',      // default role
    adminCode: ''      // filled only if role==='admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Build payload
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      };
      // include adminCode only for admin signup
      if (form.role === 'admin') {
        payload.adminCode = form.adminCode;
      }

      const { data } = await axios.post(
        'http://localhost:5000/api/auth/signup',
        payload
      );

      localStorage.setItem('token', data.token);
      
      // Check if user is admin and redirect accordingly
      try {
        const decoded = jwtDecode(data.token);
        if (decoded.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/jobs'); // Regular users go to jobs page
        }
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        navigate('/jobs'); // Fallback to jobs page
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            type="text"
            className="auth-input"
            value={form.name}
            onChange={onChange}
            placeholder="Your full name"
            required
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            className="auth-input"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            className="auth-input"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            required
          />

          <label>Confirm Password</label>
          <input
            name="confirm"
            type="password"
            className="auth-input"
            value={form.confirm}
            onChange={onChange}
            placeholder="••••••••"
            required
          />

          {/* Role selector */}
          <div className="auth-role">
            <label>
              <input
                type="radio"
                name="role"
                value="user"
                checked={form.role === 'user'}
                onChange={onChange}
              />{' '}
              User
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === 'admin'}
                onChange={onChange}
              />{' '}
              Admin
            </label>
          </div>

          {/* Admin code input, only if role is admin */}
          {form.role === 'admin' && (
            <>
              <label>Admin Invite Code</label>
              <input
                name="adminCode"
                type="text"
                className="auth-input"
                value={form.adminCode}
                onChange={onChange}
                placeholder="Enter admin code"
                required
              />
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
