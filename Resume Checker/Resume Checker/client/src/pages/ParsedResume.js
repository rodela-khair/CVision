// client/src/pages/ParsedResume.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/parsedResume.css';

export default function ParsedResume() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchParsed = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/resume/${id}/parsed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.parsedData);
    };
    fetchParsed();
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="parsed-page">
      <div className="parsed-container">
        <h2 className="parsed-title">Parsed Resume Details</h2>
        <div className="parsed-sections">
          <div className="parsed-section">
            <h3>Skills</h3>
            <ul>{data.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          {/* if you later re-enable education/experience, add those here */}
        </div>
      </div>
    </div>
  );
}
