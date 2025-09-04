import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general-inquiry'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post('/api/feedback/submit', formData, { headers });

      if (response.data.success) {
        setIsSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ 
            name: '', 
            email: '', 
            subject: '', 
            message: '', 
            category: 'general-inquiry' 
          });
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-title">📧 Get in Touch</h1>
          <p className="contact-subtitle">We'd love to hear from you</p>
        </div>

        <div className={`contact-content ${isAdmin ? 'admin-centered' : ''}`}>
          <div className="contact-info">
            <h2>🤝 Connect With Us</h2>
            <div className="info-items">
              <div className="info-item">
                <div className="info-icon">📍</div>
                <div>
                  <h3>Our Office</h3>
                  <p>123 Career Street<br />Tech City, TC 12345</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div>
                  <h3>Email Us</h3>
                  <p>support@resumechecker.com<br />hello@resumechecker.com</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">📞</div>
                <div>
                  <h3>Call Us</h3>
                  <p>+1 (555) 123-4567<br />Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">🌐</div>
                <div>
                  <h3>Follow Us</h3>
                  <div className="social-links">
                    <a href="#" className="social-link">LinkedIn</a>
                    <a href="#" className="social-link">Twitter</a>
                    <a href="#" className="social-link">Facebook</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isAdmin && (
          <div className="contact-form-section">
            <h2>💬 Send us a Message</h2>
            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
              </div>
            )}
            {isSubmitted ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thank you for contacting us. We'll get back to you soon!</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="What's this about?"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="general-inquiry">General Inquiry</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="bug-report">Bug Report</option>
                      <option value="feature-request">Feature Request</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Tell us how we can help you..."
                    disabled={loading}
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Sending...
                    </>
                  ) : (
                    <>🚀 Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
