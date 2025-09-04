import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobAlerts.css';

const JobAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    locations: '',
    companies: '',
    frequency: 'daily'
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/job-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load job alerts');
      
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        locations: formData.locations.split(',').map(s => s.trim()).filter(s => s),
        companies: formData.companies.split(',').map(s => s.trim()).filter(s => s)
      };

      if (editingAlert) {
        await axios.put(
          `http://localhost:5000/api/job-alerts/${editingAlert._id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/job-alerts',
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Reset form and refresh alerts
      setFormData({
        name: '', skills: '', locations: '', companies: '', frequency: 'daily'
      });
      setShowCreateForm(false);
      setEditingAlert(null);
      fetchAlerts();
      
    } catch (error) {
      console.error('Error saving alert:', error);
      setError('Failed to save job alert');
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      name: alert.name,
      skills: alert.skills.join(', '),
      locations: alert.locations.join(', '),
      companies: alert.companies.join(', '),
      frequency: alert.frequency
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this job alert?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/job-alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      setError('Failed to delete job alert');
    }
  };

  const handleToggle = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/job-alerts/${alertId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
      setError('Failed to update job alert');
    }
  };

  const handleTest = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/job-alerts/${alertId}/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Found ${response.data.matches.length} matching jobs for this alert!`);
    } catch (error) {
      console.error('Error testing alert:', error);
      setError('Failed to test job alert');
    }
  };

  const cancelEdit = () => {
    setEditingAlert(null);
    setShowCreateForm(false);
    setFormData({
      name: '', skills: '', locations: '', companies: '', frequency: 'daily'
    });
  };

  if (loading) {
    return (
      <div className="job-alerts-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your job alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-alerts-page">
      <div className="alerts-container">
        {/* Header */}
        <div className="alerts-header">
          <h1 className="alerts-title">🔔 Job Alerts</h1>
          <p className="alerts-subtitle">Get notified when new jobs match your criteria</p>
          <button 
            className="create-alert-btn"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Create New Alert
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="alert-form-overlay">
            <div className="alert-form-modal">
              <div className="form-header">
                <h2>{editingAlert ? '✏️ Edit Alert' : '➕ Create Job Alert'}</h2>
                <button className="close-form-btn" onClick={cancelEdit}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="alert-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Alert Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Frontend Developer Jobs"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="frequency">Frequency *</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="skills">Skills</label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., Node.js, Python, AWS (comma separated)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="locations">Locations</label>
                    <input
                      type="text"
                      id="locations"
                      name="locations"
                      value={formData.locations}
                      onChange={handleInputChange}
                      placeholder="e.g., New York, Remote, California (comma separated)"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="companies">Companies</label>
                    <input
                      type="text"
                      id="companies"
                      name="companies"
                      value={formData.companies}
                      onChange={handleInputChange}
                      placeholder="e.g., Google, Microsoft, Apple (comma separated)"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a10 10 0 0120 0v10z" />
            </svg>
            <h3 className="empty-title">No job alerts yet</h3>
            <p className="empty-description">
              Create your first job alert to get notified when new opportunities match your criteria.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="create-first-alert-btn"
            >
              🚀 Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div key={alert._id} className={`alert-card ${!alert.isActive ? 'inactive' : ''}`}>
                <div className="alert-header">
                  <div className="alert-info">
                    <h3 className="alert-name">{alert.name}</h3>
                    <div className="alert-meta">
                      <span className={`alert-status ${alert.isActive ? 'active' : 'inactive'}`}>
                        {alert.isActive ? '🟢 Active' : '⭕ Inactive'}
                      </span>
                      <span className="alert-frequency">📅 {alert.frequency}</span>
                    </div>
                  </div>
                  
                  <div className="alert-actions">
                    <button 
                      className="toggle-btn"
                      onClick={() => handleToggle(alert._id)}
                      title={alert.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {alert.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      className="test-btn"
                      onClick={() => handleTest(alert._id)}
                      title="Test Alert"
                    >
                      🧪
                    </button>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(alert)}
                      title="Edit Alert"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(alert._id)}
                      title="Delete Alert"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="alert-criteria">
                  {alert.skills.length > 0 && (
                    <div className="criteria-item">
                      <span className="criteria-label">�️ Skills:</span>
                      <div className="criteria-tags">
                        {alert.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="criteria-tag">{skill}</span>
                        ))}
                        {alert.skills.length > 3 && (
                          <span className="criteria-more">+{alert.skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {alert.locations.length > 0 && (
                    <div className="criteria-item">
                      <span className="criteria-label">� Locations:</span>
                      <div className="criteria-tags">
                        {alert.locations.slice(0, 2).map((location, index) => (
                          <span key={index} className="criteria-tag">{location}</span>
                        ))}
                        {alert.locations.length > 2 && (
                          <span className="criteria-more">+{alert.locations.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {alert.companies.length > 0 && (
                    <div className="criteria-item">
                      <span className="criteria-label">🏢 Companies:</span>
                      <div className="criteria-tags">
                        {alert.companies.slice(0, 2).map((company, index) => (
                          <span key={index} className="criteria-tag">{company}</span>
                        ))}
                        {alert.companies.length > 2 && (
                          <span className="criteria-more">+{alert.companies.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="alert-footer">
                  <span className="last-checked">
                    Last checked: {new Date(alert.lastChecked).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAlerts;
