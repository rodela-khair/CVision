import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} Resume Checker. All rights reserved.</p>
      <nav className="footer-links">
        <Link to="/about">About</Link>
        <span style={{color: 'rgba(255, 255, 255, 0.5)', margin: '0 0.25rem'}}>|</span>
        <Link to="/contact">Contact</Link>
        <span style={{color: 'rgba(255, 255, 255, 0.5)', margin: '0 0.25rem'}}>|</span>
        <Link to="/privacy">Privacy Policy</Link>
      </nav>
    </footer>
  );
}
