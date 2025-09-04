import React from 'react';
import BookmarkButton from './BookmarkButton';

const JobCard = ({ job, onViewDetails, showMatch = false, matchPercentage = 0 }) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(job);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return '#4CAF50';
      case 'part-time':
        return '#FF9800';
      case 'contract':
        return '#2196F3';
      case 'internship':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-title-section">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
        </div>
        
        {showMatch && matchPercentage > 0 && (
          <div className="match-badge">
            <span className="match-percentage">{matchPercentage}%</span>
            <span className="match-label">Match</span>
          </div>
        )}
      </div>

      <div className="job-card-content">
        <div className="job-meta">
          <div className="job-location">
            <span className="icon">📍</span>
            <span>{job.location || 'Location not specified'}</span>
          </div>
          
          <div className="job-type">
            <span 
              className="job-type-badge"
              style={{ backgroundColor: getJobTypeColor(job.jobType) }}
            >
              {job.jobType || 'Full-time'}
            </span>
          </div>
        </div>

        <div className="job-salary">
          <span className="icon">💰</span>
          <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
        </div>

        {job.description && (
          <div className="job-description">
            <p>{job.description.substring(0, 150)}...</p>
          </div>
        )}

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="job-skills">
            <div className="skills-label">Skills:</div>
            <div className="skills-list">
              {job.requiredSkills.slice(0, 5).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {job.requiredSkills.length > 5 && (
                <span className="skills-more">
                  +{job.requiredSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="job-card-footer">
        <button 
          className="view-details-btn"
          onClick={handleViewDetails}
        >
          👁️ View Details
        </button>
        
        <BookmarkButton jobId={job._id} />
        
        <div className="job-posted-date">
          {job.datePosted ? 
            new Date(job.datePosted).toLocaleDateString() : 
            'Recently posted'
          }
        </div>
      </div>
    </div>
  );
};

export default JobCard;
