import React from 'react';
import { jwtDecode } from 'jwt-decode';
import './About.css';

const About = () => {
  // Check if current user is admin
  const token = localStorage.getItem('token');
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      isAdmin = decoded.isAdmin === true;
    } catch (error) {
      // Invalid token, ignore
    }
  }

  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1 className="about-title">🚀 About Resume Checker</h1>
          <p className="about-subtitle">Your AI-powered career companion</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>🎯 Our Mission</h2>
            <p>
              Resume Checker is designed to revolutionize your job search experience. 
              We combine cutting-edge AI technology with intuitive design to help you 
              find your dream job faster and more efficiently than ever before.
            </p>
          </section>

          <section className="about-section">
            <h2>✨ What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📄</div>
                <h3>Smart Resume Analysis</h3>
                <p>Get instant feedback and suggestions to optimize your resume for any job position.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Job Matching</h3>
                <p>Discover jobs that perfectly match your skills, experience, and career goals.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💾</div>
                <h3>Save & Track</h3>
                <p>Bookmark interesting positions and track your applications in one place.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>💡 Why Choose Us</h2>
            <ul className="benefits-list">
              <li>✅ AI-powered resume optimization</li>
              <li>✅ Personalized job recommendations</li>
              <li>✅ User-friendly interface</li>
              <li>✅ Real-time job market insights</li>
              <li>✅ Secure and private data handling</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>🌟 Get Started Today</h2>
            <p>
              Join thousands of job seekers who have already found their perfect match. 
              Upload your resume, explore opportunities, and take the next step in your career journey.
            </p>
            {!isAdmin && (
            <div className="cta-buttons">
              <button className="cta-primary" onClick={() => window.location.href = '/jobs'}>
                🚀 Browse Jobs
              </button>
              <button className="cta-secondary" onClick={() => window.location.href = '/upload-resume'}>
                📄 Upload Resume
              </button>
            </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
