import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      setLoading(true);
      const unreadOnly = filter === 'unread' ? 'true' : 'false';
      
      const response = await axios.get(
        `http://localhost:5000/api/notifications?page=${page}&unreadOnly=${unreadOnly}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        'http://localhost:5000/api/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearReadNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all read notifications?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/notifications/clear-read', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.filter(notif => !notif.isRead));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs`); // Navigate to jobs page - you could add job ID to URL if needed
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = (now - notifDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now - notifDate) / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <h1 className="notifications-title">🔔 Notifications</h1>
          <p className="notifications-subtitle">
            Stay updated with your job alerts
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Controls */}
        <div className="notifications-controls">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({pagination.totalCount || 0})
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({(pagination.totalCount || 0) - unreadCount})
            </button>
          </div>

          <div className="action-buttons">
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                ✅ Mark All Read
              </button>
            )}
            <button className="clear-read-btn" onClick={clearReadNotifications}>
              🗑️ Clear Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a10 10 0 0120 0v10z" />
            </svg>
            <h3 className="empty-title">No notifications</h3>
            <p className="empty-description">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet. Create job alerts to start receiving them."
              }
            </p>
            <button
              onClick={() => navigate('/job-alerts')}
              className="create-alert-btn"
            >
              🚀 Create Job Alert
            </button>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.matchScore > 0 && (
                        <span className="match-score">
                          {notification.matchScore}% match
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  {notification.jobId && notification.jobId.title && (
                    <div className="job-info">
                      <span className="job-title">{notification.jobId.title}</span>
                      <span className="job-company">at {notification.jobId.company}</span>
                      <span className="job-location">📍 {notification.jobId.location}</span>
                    </div>
                  )}

                  {notification.alertId && notification.alertId.name && (
                    <div className="alert-info">
                      <span className="alert-name">Alert: {notification.alertId.name}</span>
                    </div>
                  )}
                </div>

                <div className="notification-actions">
                  {notification.jobId && (
                    <button 
                      className="view-job-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(notification.jobId._id);
                      }}
                    >
                      👁️ View Job
                    </button>
                  )}
                  <button 
                    className="delete-notification-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    🗑️
                  </button>
                </div>

                {!notification.isRead && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchNotifications(pagination.currentPage - 1)}
            >
              ← Previous
            </button>
            
            <span className="page-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button 
              className="page-btn"
              disabled={!pagination.hasMore}
              onClick={() => fetchNotifications(pagination.currentPage + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
