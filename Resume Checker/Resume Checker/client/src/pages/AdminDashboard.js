import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/analytics/dashboard?days=${selectedTimeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle token expiration
      if (err.response?.status === 401 && (err.response?.data?.expired || err.response?.data?.invalid)) {
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  const { 
    eventTotals = {}, 
    timeSeries = [], 
    topBookmarkedJobs = [], 
    skillAnalytics = {}, 
    userStats = {} 
  } = dashboardData;

  // Prepare chart data
  const kpiData = [
    {
      title: 'Resume Uploads',
      value: eventTotals.resume_upload || 0,
      icon: '📄',
      color: '#4CAF50'
    },
    {
      title: 'Match Runs',
      value: eventTotals.match_run || 0,
      icon: '🎯',
      color: '#2196F3'
    },
    {
      title: 'Jobs Bookmarked',
      value: eventTotals.job_bookmarked || 0,
      icon: '💾',
      color: '#FF9800'
    },
    {
      title: 'Active Users',
      value: userStats.uniqueUsers || 0,
      icon: '👥',
      color: '#9C27B0'
    }
  ];

  // Process time series data for charts
  const timeSeriesChart = processTimeSeriesData(timeSeries);
  const eventTypesPie = Object.entries(eventTotals).map(([type, count]) => ({
    name: formatEventType(type),
    value: count
  }));

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <div className="dashboard-actions">
          <Link to="/admin/jobs" className="manage-jobs-btn">
            🔧 Manage Jobs
          </Link>
          <Link to="/admin/feedback" className="manage-feedback-btn">
            📧 Manage Feedback
          </Link>
          <div className="time-range-selector">
            <label>Time Range: </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card" style={{ borderTopColor: kpi.color }}>
            <div className="kpi-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="kpi-content">
              <h3>{kpi.value.toLocaleString()}</h3>
              <p>{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Time Series Chart */}
        <div className="chart-container">
          <h3>📈 Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="resume_upload"
                stroke="#4CAF50"
                strokeWidth={2}
                name="Resume Uploads"
              />
              <Line
                type="monotone"
                dataKey="match_run"
                stroke="#2196F3"
                strokeWidth={2}
                name="Match Runs"
              />
              <Line
                type="monotone"
                dataKey="job_bookmarked"
                stroke="#FF9800"
                strokeWidth={2}
                name="Bookmarks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Distribution */}
        <div className="chart-container">
          <h3>🥧 Event Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypesPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypesPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Skills Chart */}
        <div className="chart-container">
          <h3>🎯 Most Demanded Skills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(skillAnalytics.topSkills || []).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="_id"
                stroke="#ccc"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  color: '#fff'
                }}
              />
              <Bar dataKey="jobCount" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Gap Chart */}
        <div className="chart-container">
          <h3>⚠️ Skills Gap (High Demand, Low Supply)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(skillAnalytics.missingSkills || []).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="_id"
                stroke="#ccc"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  color: '#fff'
                }}
              />
              <Bar dataKey="jobCount" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Bookmarked Jobs Table */}
      <div className="table-section">
        <h3>🔖 Most Bookmarked Jobs</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Bookmark Count</th>
                <th>Top Skills</th>
              </tr>
            </thead>
            <tbody>
              {topBookmarkedJobs.slice(0, 10).map((job, index) => (
                <tr key={job.jobId}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>
                    <span className="bookmark-count">{job.bookmarkCount}</span>
                  </td>
                  <td>
                    <div className="skills-tags">
                      {(job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 3 && (
                        <span className="skill-more">+{job.requiredSkills.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function processTimeSeriesData(timeSeries) {
  const dateMap = {};
  
  timeSeries.forEach(item => {
    const date = item._id.date;
    if (!dateMap[date]) {
      dateMap[date] = { date };
    }
    dateMap[date][item._id.eventType] = item.count;
  });
  
  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

function formatEventType(type) {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default AdminDashboard;
