import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Send, AlertTriangle, MessageSquare, Clock } from 'lucide-react';
import './Grievance.css';

const Grievance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState('');

  useEffect(() => {
    fetchMyGrievances();
  }, []);

  const fetchMyGrievances = async () => {
    try {
      const response = await api.get('/grievance/me');
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching grievances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaise = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grievance/raise', { issue });
      setIssue('');
      fetchMyGrievances();
    } catch (error) {
      alert("Failed to raise grievance");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Grievances...</div>;

  return (
    <div className="staff-grievance-wrapper">
      <div className="page-header">
        <h1>Grievances & Complaints</h1>
        <p>Raise your concerns directly with your HOD.</p>
      </div>

      <div className="grievance-grid">
        <div className="form-section glass">
          <h2>Raise a New Grievance</h2>
          <form onSubmit={handleRaise}>
            <div className="input-group">
              <label>Describe your issue</label>
              <textarea 
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="What seems to be the problem?"
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '10px'}}>
              <Send size={18} /> Send to HOD
            </button>
          </form>
        </div>

        <div className="history-section glass">
          <h2>Your Past Grievances</h2>
          <div className="history-list">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className={`history-card ${item.status}`}>
                <div className="card-top">
                  <span className={`status-tag ${item.status}`}>{item.status}</span>
                </div>
                <p>{item.issue}</p>
                <div className="card-bottom">
                  <Clock size={14} />
                  <span>Submitted on: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            )) : <p className="empty">You haven't filed any grievances yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grievance;
