// client/src/pages/JobListing.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/jobListing.css';
import { useParams } from 'react-router-dom';
import BookmarkButton from '../components/BookmarkButton';
import JobModal from '../components/JobModal';

export default function JobListing() {
  const { resumeId } = useParams();
  const [items, setItems] = useState([]);      // will hold only positive‐score matches
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        if (resumeId) {
          // 1) fetch all matches
          const { data } = await axios.get(`http://localhost:5000/api/match/${resumeId}`, { headers });
          // 2) keep only score>0 (at least one shared skill)
          const positive = data.matches
            .filter(match => match.score > 0)
            .sort((a, b) => b.score - a.score);
          setItems(positive);
        } else {
          // no resume: just list all jobs with no score badge
          const { data } = await axios.get('/api/jobs', { headers });
          setItems(data.jobs.map(job => ({ job, score: null })));
        }
      } catch (err) {
        console.error('Error fetching jobs/matches:', err);
        setItems([]);  // clear on error
      }
    };
    fetchJobs();
  }, [resumeId, token]);

  // apply the text‐filter on title/company/location/skills
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFiltered(
      items.filter(({ job }) =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(term))
      )
    );
  }, [items, searchTerm]);

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  const handleApply = (job) => {
    // You can add application tracking logic here
    // For now, we'll close the modal and could track the application
    closeJobModal();
  };

  return (
    <div className="job-listing-page">
      {/* Enhanced Page Header */}
      <div className="page-header">
        <h1>{resumeId ? '🎯 Your Best Matches' : '💼 Job Opportunities'}</h1>
        <p>{resumeId ? 'Jobs perfectly matched to your skills and experience' : 'Discover amazing career opportunities tailored for you'}</p>
      </div>

      {/* Enhanced Filters */}
      <div className="job-filters">
        <input
          type="text"
          placeholder="🔍 Search by title, company, location or skill..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Enhanced Job List */}
      <div className="job-list">
        {filtered.map(({ job, score }) => (
          <div key={job._id} className="job-card">
            <div className="job-card-header">
              <div className="job-info">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                <p className="location">{job.location}</p>
              </div>
              <BookmarkButton jobId={job._id} />
            </div>
            
            {score != null && (
              <div className="match-score-badge" style={{
                background: `linear-gradient(135deg, ${score > 0.7 ? '#28a745' : score > 0.4 ? '#ffc107' : '#17a2b8'}, ${score > 0.7 ? '#20c997' : score > 0.4 ? '#fd7e14' : '#6f42c1'})`,
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                🎯 {Math.round(score * 100)}% match
              </div>
            )}
            
            <div className="job-description">
              {job.description ? job.description.substring(0, 200) + '...' : 'Join our dynamic team and contribute to innovative projects that make a difference. We offer competitive compensation, great benefits, and opportunities for professional growth.'}
            </div>
            
            <div className="job-skills">
              <div className="skills-label">Required Skills</div>
              <div className="skills-container">
                {job.requiredSkills.map((sk, i) => (
                  <span key={i} className="skill-tag">{sk}</span>
                ))}
              </div>
            </div>
            
            <div className="job-actions">
              <button 
                className="view-details-btn"
                onClick={() => openJobModal(job)}
              >
                👁️ View Details & Apply
              </button>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && items.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading amazing opportunities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>
              {resumeId
                ? 'No jobs match your skills yet. Try uploading a more detailed resume or check back later for new opportunities!'
                : 'No jobs match your search criteria. Try adjusting your filters or search terms.'}
            </p>
          </div>
        ) : null}
      </div>

      {/* Job Details Modal */}
      <JobModal 
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={closeJobModal}
        onApply={handleApply}
      />
    </div>
  );
}
