import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/adminPanel.css';

export default function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    requiredSkills: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');

  // ref for scrolling
  const formRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error('Failed loading jobs:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // when entering edit mode, scroll form into view
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFilteredJobs(
      jobs.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      )
    );
  }, [jobs, searchTerm]);

  const onSearchChange = e => setSearchTerm(e.target.value);

  const onFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    const payload = {
      title: form.title,
      company: form.company,
      location: form.location,
      requiredSkills: form.requiredSkills.split(',').map(s => s.trim()),
      description: form.description
    };
    try {
      if (editingId) {
        await axios.put(`/api/jobs/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/jobs', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setForm({ title: '', company: '', location: '', requiredSkills: '', description: '' });
      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const onEdit = job => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      requiredSkills: job.requiredSkills.join(', '),
      description: job.description || ''
    });
  };

  const onDelete = async id => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await axios.delete(`/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Job Management</h2>
        <Link to="/admin" className="back-to-dashboard">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="admin-search-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="🔍 Search by title, company, or location"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      <form ref={formRef} className="job-form" onSubmit={onSubmit}>
        <input
          name="title"
          value={form.title}
          onChange={onFormChange}
          placeholder="Job Title"
          required
        />
        <input
          name="company"
          value={form.company}
          onChange={onFormChange}
          placeholder="Company"
          required
        />
        <input
          name="location"
          value={form.location}
          onChange={onFormChange}
          placeholder="Location"
          required
        />
        <input
          name="requiredSkills"
          value={form.requiredSkills}
          onChange={onFormChange}
          placeholder="Required Skills (comma separated)"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onFormChange}
          placeholder="Description (optional)"
        />
        <button type="submit">
          {editingId ? 'Update Job' : 'Create Job'}
        </button>
      </form>

      <div className="job-list">
        {filteredJobs.map(job => (
          <div key={job._id} className="job-item">
            <h3>{job.title}</h3>
            <p className="company-location">
              {job.company} &mdash; {job.location}
            </p>
            <div className="skills">
              {job.requiredSkills.map((sk, i) => (
                <span key={i}>{sk}</span>
              ))}
            </div>
            <div className="actions">
              <button onClick={() => onEdit(job)}>Edit</button>
              <button onClick={() => onDelete(job._id)}>Delete</button>
            </div>
          </div>
        ))}
        {filteredJobs.length === 0 && (
          <p className="no-results">No jobs match your search.</p>
        )}
      </div>
    </div>
  );
}
