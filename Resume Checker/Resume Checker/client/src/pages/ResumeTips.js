import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResumeTips.css';

const ResumeTips = () => {
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [resumeAnalyzed, setResumeAnalyzed] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchResumeTips();
  }, []);

  const fetchResumeTips = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/resume-tips/generate', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTips(response.data.tips);
        setResumeAnalyzed(response.data.resumeAnalyzed);
        setLastUpdated(response.data.lastUpdated);
        
        // Auto-expand sections with high priority tips
        const autoExpand = {};
        Object.keys(response.data.tips).forEach(section => {
          const hasHighPriority = response.data.tips[section].some(tip => tip.priority === 'high');
          autoExpand[section] = hasHighPriority;
        });
        setExpandedSections(autoExpand);
      } else {
        setError(response.data.message || 'Failed to generate tips');
      }
    } catch (err) {
      console.error('Error fetching resume tips:', err);
      setError(err.response?.data?.message || 'Failed to load resume tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'tip-high';
      case 'medium': return 'tip-medium';
      case 'low': return 'tip-low';
      default: return 'tip-medium';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'skills': return '🛠️';
      case 'experience': return '💼';
      case 'ats': return '🤖';
      case 'formatting': return '📝';
      case 'content': return '📋';
      default: return '💡';
    }
  };

  const getSectionTitle = (section) => {
    switch (section) {
      case 'skills': return 'Skills Enhancement';
      case 'experience': return 'Experience Optimization';
      case 'ats': return 'ATS Compatibility';
      case 'formatting': return 'Formatting & Structure';
      case 'content': return 'Content Improvement';
      default: return section.charAt(0).toUpperCase() + section.slice(1);
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

  if (loading) {
    return (
      <div className="resume-tips-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing your resume and generating personalized tips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resume-tips-container">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Generate Tips</h3>
          <p>{error}</p>
          <button onClick={fetchResumeTips} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!tips || Object.keys(tips).length === 0) {
    return (
      <div className="resume-tips-container">
        <div className="no-tips">
          <div className="no-tips-icon">✨</div>
          <h3>Great Resume!</h3>
          <p>Your resume looks good! No specific improvement suggestions at this time.</p>
          <button onClick={fetchResumeTips} className="refresh-btn">
            Re-analyze Resume
          </button>
        </div>
      </div>
    );
  }

  const totalTips = Object.values(tips).reduce((sum, sectionTips) => sum + sectionTips.length, 0);
  const highPriorityCount = Object.values(tips).reduce((sum, sectionTips) => 
    sum + sectionTips.filter(tip => tip.priority === 'high').length, 0
  );

  return (
    <div className="resume-tips-container">
      <div className="tips-header">
        <h1>Resume Improvement Tips</h1>
        <div className="tips-summary">
          <div className="summary-item">
            <span className="summary-icon">📊</span>
            <span>{totalTips} recommendations found</span>
          </div>
          <div className="summary-item">
            <span className="summary-icon">🔴</span>
            <span>{highPriorityCount} high priority</span>
          </div>
          <div className="summary-item">
            <span className="summary-icon">📄</span>
            <span>Based on: {resumeAnalyzed}</span>
          </div>
          <div className="summary-item">
            <span className="summary-icon">🕒</span>
            <span>Updated: {formatDate(lastUpdated)}</span>
          </div>
        </div>
        <button onClick={fetchResumeTips} className="refresh-tips-btn">
          🔄 Refresh Tips
        </button>
      </div>

      <div className="tips-sections">
        {Object.entries(tips).map(([section, sectionTips]) => (
          <div key={section} className="tips-section">
            <div 
              className="section-header"
              onClick={() => toggleSection(section)}
            >
              <div className="section-title">
                <span className="section-icon">{getSectionIcon(section)}</span>
                <h3>{getSectionTitle(section)}</h3>
                <span className="tips-count">({sectionTips.length})</span>
              </div>
              <span className={`expand-icon ${expandedSections[section] ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
            
            {expandedSections[section] && (
              <div className="section-content">
                {sectionTips.map((tip, index) => (
                  <div key={index} className={`tip-card ${getPriorityClass(tip.priority)}`}>
                    <div className="tip-header">
                      <span className="priority-icon">{getPriorityIcon(tip.priority)}</span>
                      <h4 className="tip-title">{tip.title}</h4>
                      <span className={`priority-badge priority-${tip.priority}`}>
                        {tip.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="tip-description">{tip.description}</p>
                    <div className="tip-action">
                      <strong>Action:</strong> {tip.action}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="tips-footer">
        <div className="disclaimer">
          <p>
            <strong>💡 Pro Tip:</strong> These suggestions are based on your current resume and skill gap analysis. 
            Consider implementing high-priority recommendations first for maximum impact.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeTips;
