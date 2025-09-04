// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import './styles/layout.css';


import SignIn         from './pages/SignIn';
import SignUp         from './pages/SignUp';
import UploadResume   from './pages/UploadResume';
import ParsedResume   from './pages/ParsedResume';  // ensure this file exists
import JobListing     from './pages/JobListing';
import AdminPanel     from './pages/AdminPanel';
import AdminDashboard from './pages/AdminDashboard';
import SavedJobs      from './pages/SavedJobs';
import SkillGapPage   from './pages/SkillGapPage';
import About          from './pages/About';
import Contact        from './pages/Contact';
import Privacy        from './pages/Privacy';
import JobAlerts      from './pages/JobAlerts';
import Notifications  from './pages/Notifications';
import ResumeTips     from './pages/ResumeTips';
import FeedbackManagement from './components/FeedbackManagement';
import Layout         from './components/Layout';


function App() {
  const token = localStorage.getItem('token');
  let isAdmin = false;
  if (token) {
    try {
      isAdmin = jwtDecode(token).isAdmin;
    } catch (e) {
      console.warn('Invalid JWT:', e);
    }
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/upload-resume" element={<UploadResume />} />
          <Route path="/resume/:id/parsed" element={<ParsedResume />} />
          <Route path="/jobs/:resumeId" element={<JobListing />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/resume-tips" element={<ResumeTips />} />
          <Route path="/job-alerts" element={<JobAlerts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/jobs" replace />} />
          <Route path="/admin/jobs" element={isAdmin ? <AdminPanel /> : <Navigate to="/jobs" replace />} />
          <Route path="/admin/feedback" element={isAdmin ? <FeedbackManagement /> : <Navigate to="/jobs" replace />} />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
