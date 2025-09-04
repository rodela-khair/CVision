import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookmarkButton.css';

const BookmarkButton = ({ jobId, className = '' }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [jobId]);

  const checkBookmarkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`http://localhost:5000/api/bookmarks/${jobId}/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please sign in to bookmark jobs');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/bookmarks/${jobId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsBookmarked(response.data.isBookmarked);
      
      // Success - bookmark toggled successfully
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert(error.response?.data?.message || 'Error updating bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''} ${loading ? 'loading' : ''} ${className}`}
    >
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <svg
          className="bookmark-icon"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
      <span className="bookmark-text">
        {loading ? 'Updating...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </button>
  );
};

export default BookmarkButton;
