import React from 'react';
import './JobModal.css';

const JobModal = ({ job, isOpen, onClose, onApply }) => {
  if (!isOpen || !job) return null;

  const handleApply = () => {
    // You can customize this function to integrate with actual job application systems
    alert(`Application submitted for ${job.title} at ${job.company}!\n\nIn a real application, this would:\n- Open the company's application page\n- Send application data to the backend\n- Track application status`);
    onApply(job);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="job-modal-overlay" onClick={handleOverlayClick}>
      <div className="job-modal">
        <div className="job-modal-header">
          <div>
            <h2 className="job-modal-title">{job.title}</h2>
            <p className="job-modal-company">{job.company}</p>
            <p className="job-modal-location">📍 {job.location}</p>
          </div>
          <button className="job-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="job-modal-content">
          <div className="job-modal-section" data-section="skills">
            <h3>🛠️ Required Skills</h3>
            <div className="job-modal-skills">
              {job.requiredSkills.map((skill, index) => (
                <span key={index} className="job-modal-skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {job.description && (
            <div className="job-modal-section" data-section="description">
              <h3>📋 Job Description</h3>
              <div className="job-modal-description">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          <div className="job-modal-section" data-section="application">
            <h3>📨 How to Apply</h3>
            <p>Click the "Apply Now" button below to submit your application for this position. Make sure your resume is up-to-date and highlights the required skills mentioned above.</p>
          </div>
        </div>

        <div className="job-modal-footer">
          <button className="job-modal-cancel" onClick={onClose}>
            Close
          </button>
          <button className="job-modal-apply" onClick={handleApply}>
            🚀 Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
