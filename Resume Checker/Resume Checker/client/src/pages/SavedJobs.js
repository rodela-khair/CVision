import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookmarkButton from '../components/BookmarkButton';
import JobModal from '../components/JobModal';
import './SavedJobs.css';

const SavedJobs = () => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarkedJobs();
  }, []);

  const fetchBookmarkedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookmarkedJobs(response.data.bookmarkedJobs);
    } catch (error) {
      console.error('Error fetching bookmarked jobs:', error);
      setError('Failed to load saved jobs');
      
      if (error.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJobRemoved = (jobId) => {
    // Remove job from local state when bookmark is removed
    setBookmarkedJobs(prev => prev.filter(job => job._id !== jobId));
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  const handleApply = (job) => {
    // Simulate application process
    alert(`Applied to ${job.title} at ${job.company}!`);
    closeJobModal();
  };

  if (loading) {
    return (
      <div className="saved-jobs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-container">
        {/* Header */}
        <div className="saved-jobs-header">
          <h1 className="saved-jobs-title">💾 Saved Jobs</h1>
          <p className="saved-jobs-subtitle">Your bookmarked opportunities</p>
          <p className="saved-jobs-count">
            {bookmarkedJobs.length} job{bookmarkedJobs.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {bookmarkedJobs.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="empty-title">No saved jobs yet</h3>
            <p className="empty-description">
              Start browsing jobs and bookmark the ones you're interested in to see them here.<br />
              Build your collection of dream opportunities!
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="browse-jobs-btn"
            >
              🚀 Browse Jobs
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {bookmarkedJobs.map((job) => (
              <div key={job._id} className="saved-job-card">
                <div className="job-card-header">
                  <div className="job-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                    <p className="job-location">{job.location}</p>
                  </div>
                </div>

                {/* Job Description */}
                {job.description && (
                  <div className="job-description">
                    {job.description}
                  </div>
                )}

                {/* Required Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="job-skills">
                    <p className="skills-label">Required Skills</p>
                    <div className="skills-container">
                      {job.requiredSkills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="skill-more">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="job-actions">
                  <button
                    onClick={() => openJobModal(job)}
                    className="view-details-btn"
                  >
                    👁️ View Details & Apply
                  </button>
                  
                  <div onClick={() => handleJobRemoved(job._id)}>
                    <BookmarkButton 
                      jobId={job._id} 
                      className="bookmark-compact"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="bottom-actions">
          <button
            onClick={() => navigate('/jobs')}
            className="browse-more-btn"
          >
            🔍 Browse More Jobs
          </button>
        </div>

        {/* Job Details Modal */}
        <JobModal 
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={closeJobModal}
          onApply={handleApply}
        />
      </div>
    </div>
  );
};

export default SavedJobs;
