import React, { useState, useEffect } from 'react';
import SkillGapAnalysis from '../components/SkillGapAnalysis';
import axios from 'axios';
import './SkillGapPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SkillGapPage = () => {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch user's resumes
  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/resume/user-resumes`, {
        headers: getAuthHeaders()
      });
      
      if (Array.isArray(response.data)) {
        setResumes(response.data);
        if (response.data.length > 0) {
          setSelectedResumeId(response.data[0]._id);
        }
      } else {
        console.warn('Unexpected resume data format:', response.data);
        setResumes([]);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      
      // For now, provide mock data to demonstrate the feature
      const mockResumes = [
        {
          _id: 'mock-resume-1',
          fileName: 'John Doe - Software Engineer.pdf',
          uploadDate: new Date(),
          skillsCount: 14,
          skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git', 'Docker', 'AWS', 'SQL', 'HTML', 'CSS', 'TypeScript', 'Redux'],
          extractedSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git', 'Docker', 'AWS', 'SQL', 'HTML', 'CSS', 'TypeScript', 'Redux']
        },
        {
          _id: 'mock-resume-2', 
          fileName: 'Jane Smith - Data Analyst.pdf',
          uploadDate: new Date(),
          skillsCount: 11,
          skills: ['Python', 'R', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'Scikit-learn'],
          extractedSkills: ['Python', 'R', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'Scikit-learn']
        }
      ];
      
      setResumes(mockResumes);
      setSelectedResumeId(mockResumes[0]._id);
      
      if (err.response?.status === 401) {
        setError('Using demo data - please log in to access your actual resumes');
      } else if (err.response?.status === 403) {
        setError('Using demo data - access denied. Please make sure you are logged in.');
      } else {
        setError(`Using demo data - API unavailable: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  // Fetch available jobs
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs`, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.jobs) {
        setJobs(response.data.jobs);
      } else if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        console.warn('Unexpected jobs data format:', response.data);
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      
      // Provide mock job data for demonstration
      const mockJobs = [
        {
          _id: 'mock-job-1',
          title: 'Senior Full Stack Developer',
          company: 'TechCorp Inc',
          requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'MongoDB', 'TypeScript', 'GraphQL', 'Kubernetes'],
          skillsRequired: ['JavaScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS', 'MongoDB', 'TypeScript', 'GraphQL', 'Kubernetes']
        },
        {
          _id: 'mock-job-2',
          title: 'Data Scientist',
          company: 'DataCorp LLC',
          requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Statistics', 'Deep Learning', 'NLP', 'Apache Spark'],
          skillsRequired: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Statistics', 'Deep Learning', 'NLP', 'Apache Spark']
        },
        {
          _id: 'mock-job-3',
          title: 'Frontend Developer',
          company: 'WebDev Studios',
          requiredSkills: ['JavaScript', 'React', 'Vue.js', 'HTML', 'CSS', 'SASS', 'TypeScript', 'Webpack', 'Jest', 'Cypress'],
          skillsRequired: ['JavaScript', 'React', 'Vue.js', 'HTML', 'CSS', 'SASS', 'TypeScript', 'Webpack', 'Jest', 'Cypress']
        }
      ];
      
      setJobs(mockJobs);
      
      if (err.response?.status === 401) {
        setError('Using demo data - please log in to access job listings');
      } else {
        setError(`Using demo data - API unavailable: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchJobs();
  }, []);

  return (
    <div className="skill-gap-page">
      <div className="container">
        <div className="page-header">
          <h1>Skill Gap Analysis</h1>
          <p className="page-description">
            Analyze skill gaps between your resume and job requirements to identify areas for improvement.
          </p>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        {/* Selection Controls */}
        <div className="selection-panel">
          <div className="selection-grid">
            <div className="form-group">
              <label htmlFor="resume-select">Select Resume</label>
              <select
                id="resume-select"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="form-select"
              >
                <option value="">Select a resume...</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.fileName || `Resume ${resume._id.slice(-6)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="job-select">Select Job (Optional - for specific comparison)</label>
              <select
                id="job-select"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="form-select"
              >
                <option value="">None - Market Analysis Only</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} at {job.company}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Component */}
        <div className="analysis-panel">
          {selectedResumeId ? (
            <SkillGapAnalysis 
              resumeId={selectedResumeId} 
              jobId={selectedJobId || null}
            />
          ) : (
            <div className="empty-state">
              <h3>Please upload a resume first to analyze skill gaps.</h3>
              <p>You need to have at least one resume uploaded to perform skill gap analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
