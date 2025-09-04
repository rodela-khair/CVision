import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/uploadResume.css';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [existingResume, setExistingResume] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Check for existing resume on component mount
  useEffect(() => {
    checkExistingResume();
  }, []);

  const checkExistingResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/resume/user-resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.length > 0) {
        // User has existing resume(s) - take the most recent one
        setExistingResume(res.data[0]);
      }
    } catch (err) {
      console.error('Error checking existing resume:', err);
      // If error, assume no existing resume
    } finally {
      setCheckingExisting(false);
    }
  };

  const onChange = e => setFile(e.target.files[0]);

  const deleteExistingResume = async () => {
    if (!existingResume) return;
    
    setDeleteLoading(true);
    setMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/resume/${existingResume._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setExistingResume(null);
        setMsg('Resume deleted successfully. You can now upload a new one.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setMsg(err.response?.data?.msg || 'Failed to delete resume');
    } finally {
      setDeleteLoading(false);
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Prevent upload if user already has a resume
    if (existingResume) {
      setMsg('You already have a resume uploaded. Please delete it first to upload a new one.');
      return;
    }

    if (!file) {
      setMsg('Please select a file.');
      return;
    }

    setLoading(true);
    setMsg('');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/resume/upload',    // using your CRA proxy
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        }
      );

      setLoading(false);
      
      if (res.data.fileName) {
        const resumeId = res.data.resume?._id;
        if (resumeId) {
          // Update existing resume state
          setExistingResume({
            _id: resumeId,
            fileName: res.data.fileName,
            uploadDate: new Date()
          });
          setFile(null); // Clear file input
          setMsg('Resume uploaded successfully!');
          // Navigate to jobs page after a short delay
          setTimeout(() => {
            navigate(`/jobs/${resumeId}`);
          }, 1500);
        } else {
          setMsg(res.data.msg || 'Upload succeeded');
        }
      }
    } catch (err) {
      console.error('Upload error:', err.response || err);
      setLoading(false);
      setMsg(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        `Upload failed (${err.response?.status || err.message})`
      );
    }
  };

  if (checkingExisting) {
    return (
      <div className="upload-resume-page">
        <div className="upload-resume-container">
          <div className="loading-state">
            <span className="loading-spinner"></span>
            <p>Checking existing resume...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-resume-page">
      <div className="upload-resume-container">
        <h2 className="upload-resume-title">
          {existingResume ? 'Your Resume' : 'Upload Your Resume'}
        </h2>
        
        {msg && <p className="upload-resume-msg">{msg}</p>}
        
        {existingResume ? (
          // Show existing resume with delete option
          <div className="existing-resume-section">
            <div className="resume-info-card">
              <div className="resume-icon">📄</div>
              <div className="resume-details">
                <h3>{existingResume.fileName}</h3>
                <p>Uploaded: {new Date(existingResume.uploadDate).toLocaleDateString()}</p>
                {existingResume.skillsCount && (
                  <p>Skills detected: {existingResume.skillsCount}</p>
                )}
              </div>
            </div>
            
            <div className="resume-actions">
              <button 
                className="view-resume-btn"
                onClick={() => navigate(`/resume/${existingResume._id}/parsed`)}
              >
                📋 View Details
              </button>
              <button 
                className="browse-jobs-btn"
                onClick={() => navigate(`/jobs/${existingResume._id}`)}
              >
                🔍 Browse Jobs
              </button>
              <button 
                className="delete-resume-btn" 
                onClick={deleteExistingResume}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : '🗑️ Delete Resume'}
              </button>
            </div>
            
            <div className="upload-restriction-notice">
              <p>💡 <strong>Note:</strong> You can only have one resume at a time. Delete your current resume to upload a new one.</p>
            </div>
          </div>
        ) : (
          // Show upload form
          <form className="upload-resume-form" onSubmit={onSubmit}>
            <div className="file-input-section">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="upload-resume-input"
                onChange={onChange}
                disabled={loading}
              />
              <p className="file-types">Supported formats: PDF, DOC, DOCX</p>
            </div>
            <button 
              className="upload-resume-button" 
              type="submit" 
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Uploading...
                </>
              ) : (
                '📤 Upload Resume'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
