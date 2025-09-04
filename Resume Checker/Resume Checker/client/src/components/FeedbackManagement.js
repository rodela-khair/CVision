import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackManagement.css';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    page: 1
  });

  // Modal state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [filters]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      params.append('page', filters.page);
      params.append('limit', '20');

      const response = await axios.get(`/api/feedback/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setFeedback(response.data.feedback);
        setStats(response.data.stats);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message || 'Failed to fetch feedback');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when changing filters
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const openModal = (feedbackItem) => {
    setSelectedFeedback({
      ...feedbackItem,
      newStatus: feedbackItem.status,
      newPriority: feedbackItem.priority,
      newAdminNotes: feedbackItem.adminNotes || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
    setUpdating(false);
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        status: selectedFeedback.newStatus,
        priority: selectedFeedback.newPriority,
        adminNotes: selectedFeedback.newAdminNotes
      };

      const response = await axios.put(`/api/feedback/admin/${selectedFeedback._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update the feedback in the list
        setFeedback(prev => prev.map(item => 
          item._id === selectedFeedback._id ? response.data.feedback : item
        ));
        closeModal();
        fetchFeedback(); // Refresh to get updated stats
      } else {
        setError(response.data.message || 'Failed to update feedback');
      }
    } catch (err) {
      console.error('Error updating feedback:', err);
      setError(err.response?.data?.message || 'Failed to update feedback');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/feedback/admin/${feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setFeedback(prev => prev.filter(item => item._id !== feedbackId));
        fetchFeedback(); // Refresh to get updated stats
      } else {
        setError(response.data.message || 'Failed to delete feedback');
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError(err.response?.data?.message || 'Failed to delete feedback');
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-new';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bug-report': return '🐛';
      case 'feature-request': return '✨';
      case 'technical-support': return '🔧';
      case 'feedback': return '💭';
      case 'general-inquiry': return '❓';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && feedback.length === 0) {
    return (
      <div className="feedback-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-management">
      <div className="feedback-header">
        <h1>📧 Feedback Management</h1>
        {stats && (
          <div className="stats-overview">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.new}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="bug-report">Bug Report</option>
            <option value="feature-request">Feature Request</option>
            <option value="technical-support">Technical Support</option>
            <option value="feedback">Feedback</option>
            <option value="general-inquiry">General Inquiry</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority:</label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button onClick={fetchFeedback} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Feedback List */}
      <div className="feedback-list">
        {feedback.length === 0 ? (
          <div className="no-feedback">
            <p>No feedback found matching the current filters.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item._id} className="feedback-item">
              <div className="feedback-header-row">
                <div className="feedback-meta">
                  <span className="category-icon">{getCategoryIcon(item.category)}</span>
                  <span className="feedback-subject">{item.subject}</span>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {item.status.replace('-', ' ')}
                  </span>
                  <span className={`priority-badge ${getPriorityClass(item.priority)}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>
                <div className="feedback-actions">
                  <button 
                    onClick={() => openModal(item)} 
                    className="view-btn"
                  >
                    👁️ View
                  </button>
                  <button 
                    onClick={() => handleDeleteFeedback(item._id)} 
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              <div className="feedback-details">
                <p><strong>From:</strong> {item.name} ({item.email})</p>
                <p><strong>Created:</strong> {formatDate(item.createdAt)}</p>
                <p><strong>Category:</strong> {item.category.replace('-', ' ')}</p>
                <p className="feedback-preview">{item.message.substring(0, 150)}...</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalItems} total items)
          </span>
          
          <button 
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === pagination.totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedFeedback && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📧 Feedback Details</h2>
              <button onClick={closeModal} className="close-modal">×</button>
            </div>
            
            <div className="modal-body">
              <div className="feedback-full-details">
                <p><strong>From:</strong> {selectedFeedback.name} ({selectedFeedback.email})</p>
                <p><strong>Subject:</strong> {selectedFeedback.subject}</p>
                <p><strong>Category:</strong> {selectedFeedback.category.replace('-', ' ')}</p>
                <p><strong>Created:</strong> {formatDate(selectedFeedback.createdAt)}</p>
                {selectedFeedback.userId && (
                  <p><strong>User ID:</strong> {selectedFeedback.userId._id}</p>
                )}
                
                <div className="message-section">
                  <strong>Message:</strong>
                  <div className="message-content">{selectedFeedback.message}</div>
                </div>
                
                <div className="update-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="status-update">Status:</label>
                      <select
                        id="status-update"
                        value={selectedFeedback.newStatus}
                        onChange={(e) => setSelectedFeedback(prev => ({
                          ...prev,
                          newStatus: e.target.value
                        }))}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="priority-update">Priority:</label>
                      <select
                        id="priority-update"
                        value={selectedFeedback.newPriority}
                        onChange={(e) => setSelectedFeedback(prev => ({
                          ...prev,
                          newPriority: e.target.value
                        }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="admin-notes">Admin Notes:</label>
                    <textarea
                      id="admin-notes"
                      value={selectedFeedback.newAdminNotes}
                      onChange={(e) => setSelectedFeedback(prev => ({
                        ...prev,
                        newAdminNotes: e.target.value
                      }))}
                      rows="4"
                      placeholder="Add internal notes about this feedback..."
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeModal} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleUpdateFeedback} 
                className="update-btn"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
