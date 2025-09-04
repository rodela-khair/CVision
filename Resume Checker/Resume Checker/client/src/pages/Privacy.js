import React from 'react';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1 className="privacy-title">🔒 Privacy Policy</h1>
          <p className="privacy-subtitle">Your privacy is our priority</p>
          <p className="last-updated">Last updated: August 17, 2025</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>📋 Information We Collect</h2>
            <p>
              At Resume Checker, we collect information to provide you with the best job search experience:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, and contact details</li>
              <li><strong>Resume Data:</strong> Skills, experience, education, and career preferences</li>
              <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
              <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>🎯 How We Use Your Information</h2>
            <p>
              We use your information to enhance your job search experience:
            </p>
            <ul>
              <li>Provide personalized job recommendations</li>
              <li>Analyze and improve your resume</li>
              <li>Send relevant job alerts and updates</li>
              <li>Improve our platform and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>🤝 Information Sharing</h2>
            <p>
              We respect your privacy and limit information sharing:
            </p>
            <div className="sharing-grid">
              <div className="sharing-card">
                <div className="sharing-icon">✅</div>
                <h3>What We DO</h3>
                <ul>
                  <li>Share anonymized data for analytics</li>
                  <li>Provide job matching services</li>
                  <li>Comply with legal requests</li>
                </ul>
              </div>
              <div className="sharing-card">
                <div className="sharing-icon">❌</div>
                <h3>What We DON'T Do</h3>
                <ul>
                  <li>Sell your personal information</li>
                  <li>Share resumes without consent</li>
                  <li>Use data for unrelated purposes</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>🔐 Data Security</h2>
            <p>
              We implement industry-standard security measures:
            </p>
            <div className="security-features">
              <div className="security-item">
                <span className="security-icon">🛡️</span>
                <strong>Encryption:</strong> All data is encrypted in transit and at rest
              </div>
              <div className="security-item">
                <span className="security-icon">🔒</span>
                <strong>Access Control:</strong> Strict access controls and authentication
              </div>
              <div className="security-item">
                <span className="security-icon">🔍</span>
                <strong>Monitoring:</strong> Continuous security monitoring and auditing
              </div>
              <div className="security-item">
                <span className="security-icon">⚡</span>
                <strong>Updates:</strong> Regular security updates and patches
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>⚙️ Your Rights</h2>
            <p>
              You have control over your personal information:
            </p>
            <div className="rights-list">
              <div className="right-item">
                <h4>🔍 Access</h4>
                <p>Request a copy of your personal data</p>
              </div>
              <div className="right-item">
                <h4>✏️ Correction</h4>
                <p>Update or correct your information</p>
              </div>
              <div className="right-item">
                <h4>🗑️ Deletion</h4>
                <p>Request deletion of your data</p>
              </div>
              <div className="right-item">
                <h4>📤 Portability</h4>
                <p>Export your data in a portable format</p>
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>🍪 Cookies Policy</h2>
            <p>
              We use cookies to improve your experience:
            </p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p>
              You can control cookies through your browser settings or our cookie preferences center.
            </p>
          </section>

          <section className="privacy-section">
            <h2>📞 Contact Us</h2>
            <p>
              Questions about this privacy policy? We're here to help:
            </p>
            <div className="contact-info">
              <div className="contact-method">
                <strong>📧 Email:</strong> privacy@resumechecker.com
              </div>
              <div className="contact-method">
                <strong>📍 Address:</strong> 123 Career Street, Tech City, TC 12345
              </div>
              <div className="contact-method">
                <strong>📞 Phone:</strong> +1 (555) 123-4567
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <h2>🔄 Policy Updates</h2>
            <p>
              We may update this privacy policy occasionally. When we do:
            </p>
            <ul>
              <li>We'll notify you of significant changes</li>
              <li>The "Last updated" date will be revised</li>
              <li>Continued use constitutes acceptance of changes</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
