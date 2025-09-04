import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import './SkillGapAnalysis.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SkillGapAnalysis = ({ resumeId, jobId = null }) => {
  const [analysis, setAnalysis] = useState(null);
  const [multiJobAnalysis, setMultiJobAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('multi'); // 'single', 'multi', 'recommendations'

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Single job analysis
  const fetchSingleJobAnalysis = async () => {
    if (!jobId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/api/skill-gap/resume/${resumeId}/job/${jobId}`,
        { headers: getAuthHeaders() }
      );
      setAnalysis(response.data.data);
    } catch (err) {
      console.error('Single job analysis error:', err);
      setError(err.response?.data?.message || 'Failed to fetch skill gap analysis');
    } finally {
      setLoading(false);
    }
  };

  // Multi-job analysis
  const fetchMultiJobAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/api/skill-gap/resume/${resumeId}/multi-job?limit=10`,
        { headers: getAuthHeaders() }
      );
      setMultiJobAnalysis(response.data.data);
    } catch (err) {
      console.error('Multi-job analysis error:', err);
      setError(err.response?.data?.message || 'Failed to fetch multi-job analysis');
    } finally {
      setLoading(false);
    }
  };

  // Skill recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/api/skill-gap/resume/${resumeId}/recommendations`,
        { headers: getAuthHeaders() }
      );
      setRecommendations(response.data.data);
    } catch (err) {
      console.error('Recommendations error:', err);
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'single' && jobId) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchSingleJobAnalysis();
    } else if (activeView === 'multi') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchMultiJobAnalysis();
    } else if (activeView === 'recommendations') {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchRecommendations();
    }
  }, [activeView, resumeId, jobId]);

  // Chart colors
  const COLORS = {
    matched: '#4caf50',
    missing: '#f44336',
    extra: '#ff9800'
  };

  const renderSingleJobAnalysis = () => {
    if (!analysis) return null;

    const pieData = [
      { name: 'Matched Skills', value: analysis.matchingSkills?.length || 0, color: COLORS.matched },
      { name: 'Missing Skills', value: analysis.missingSkills?.length || 0, color: COLORS.missing }
    ];

    return (
      <div>
        <h3>Skill Gap Analysis: {analysis.jobTitle} at {analysis.company}</h3>
        
        <div className="skill-gap-grid">
          {/* KPI Cards */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-value primary">{analysis.matchPercentage || 0}%</div>
              <div className="kpi-label">Skills Match</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value success">{analysis.matchingSkills?.length || 0}</div>
              <div className="kpi-label">Matched Skills</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value error">{analysis.missingSkills?.length || 0}</div>
              <div className="kpi-label">Missing Skills</div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="chart-container">
            <h4>Skills Breakdown</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Lists */}
          <div className="skills-container">
            <div className="skills-section">
              <h4 className="success">Matched Skills ({analysis.matchingSkills?.length || 0})</h4>
              <div className="skill-chips">
                {analysis.matchingSkills?.map((skill, index) => (
                  <span key={index} className="skill-chip success">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="skills-section">
              <h4 className="error">Missing Skills ({analysis.missingSkills?.length || 0})</h4>
              <div className="skill-chips">
                {analysis.missingSkills?.map((skill, index) => (
                  <span key={index} className="skill-chip error">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMultiJobAnalysis = () => {
    if (!multiJobAnalysis) return null;

    const chartData = multiJobAnalysis.aggregatedInsights?.topMissingSkills
      ?.slice(0, 10)
      ?.map(item => ({
        skill: item.skill,
        count: item.count,
        frequency: item.frequency || Math.round((item.count / multiJobAnalysis.totalJobsAnalyzed) * 100)
      })) || [];

    return (
      <div>
        <h3>Multi-Job Skill Gap Analysis ({multiJobAnalysis.totalJobsAnalyzed} jobs analyzed)</h3>
        
        <div className="skill-gap-grid">
          {/* Summary Card */}
          <div className="kpi-cards">
            <div className="kpi-card large">
              <div className="kpi-value primary">{multiJobAnalysis.aggregatedInsights?.averageMatchPercentage || 0}%</div>
              <div className="kpi-label">Average Skills Match Across Top Jobs</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-container full-width">
            <h4>Most Missing Skills Across Job Market</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="skill" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'count' ? `${value} jobs` : `${value}%`,
                    name === 'count' ? 'Jobs Requiring' : 'Frequency'
                  ]}
                />
                <Bar dataKey="count" fill={COLORS.missing} name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Missing Skills Chips */}
          <div className="skills-container full-width">
            <h4>Skills to Focus On</h4>
            <div className="skill-chips">
              {multiJobAnalysis.aggregatedInsights?.topMissingSkills?.slice(0, 15).map((item, index) => (
                <span key={index} className="skill-chip warning">
                  {item.skill} ({item.count} jobs)
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!recommendations) return null;

    return (
      <div>
        <h3>Skill Recommendations</h3>
        
        <div className="skill-gap-grid">
          {/* Summary */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-value primary">{recommendations.currentMatchPercentage}%</div>
              <div className="kpi-label">Current Average Match</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value success">{recommendations.potentialImprovement}%</div>
              <div className="kpi-label">Potential with Top Skills</div>
            </div>
          </div>

          {/* Critical Skills */}
          <div className="skills-container">
            <div className="skills-section">
              <h4 className="error">Critical Skills (High Priority)</h4>
              <div className="skill-chips">
                {recommendations.criticalSkills?.map((item, index) => (
                  <span key={index} className="skill-chip error">
                    {item.skill} ({item.count} jobs)
                  </span>
                ))}
              </div>
            </div>

            <div className="skills-section">
              <h4 className="warning">Improvement Areas</h4>
              <div className="skill-chips">
                {recommendations.improvementAreas?.map((item, index) => (
                  <span key={index} className="skill-chip warning">
                    {item.skill} ({item.count} jobs)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Analyzing skill gaps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-analysis">
      {/* Navigation Buttons */}
      <div className="view-tabs">
        <button
          className={`tab-button ${activeView === 'multi' ? 'active' : ''}`}
          onClick={() => setActiveView('multi')}
        >
          Market Analysis
        </button>
        {jobId && (
          <button
            className={`tab-button ${activeView === 'single' ? 'active' : ''}`}
            onClick={() => setActiveView('single')}
          >
            Job Comparison
          </button>
        )}
        <button
          className={`tab-button ${activeView === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveView('recommendations')}
        >
          Recommendations
        </button>
      </div>

      <div className="tab-divider"></div>

      {/* Content */}
      <div className="tab-content">
        {activeView === 'single' && renderSingleJobAnalysis()}
        {activeView === 'multi' && renderMultiJobAnalysis()}
        {activeView === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
