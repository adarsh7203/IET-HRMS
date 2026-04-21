import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Send, FileText, Clock, AlertCircle } from 'lucide-react';
import './Leave.css';

const Leave = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    reason: '',
    from_date: '',
    to_date: ''
  });

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get('/leaves/me');
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves/apply', formData);
      setFormData({ reason: '', from_date: '', to_date: '' });
      fetchMyLeaves();
    } catch (error) {
      alert("Failed to apply for leave");
    }
  };

  if (loading) return <div className="loading-spinner">Loading History...</div>;

  return (
    <div className="staff-leave-wrapper">
      <div className="page-header">
        <h1>Leave Management</h1>
        <p>Apply for leaves and track your application status.</p>
      </div>

      <div className="leave-grid">
        <div className="leave-form-section glass">
          <h2>Apply for Leave</h2>
          <form onSubmit={handleApply} className="apply-form">
            <div className="input-group">
              <label>Reason for Leave</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Briefly explain your reason..."
                required
              />
            </div>
            <div className="date-inputs">
              <div className="input-group">
                <label>From Date</label>
                <input 
                  type="date" 
                  value={formData.from_date}
                  onChange={(e) => setFormData({...formData, from_date: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>To Date</label>
                <input 
                  type="date" 
                  value={formData.to_date}
                  onChange={(e) => setFormData({...formData, to_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '10px'}}>
              <Send size={18} /> Submit Application
            </button>
          </form>
        </div>

        <div className="leave-history-section glass">
          <h2>Your Leave History</h2>
          <div className="history-list">
            {history.length > 0 ? history.map((leave) => (
              <div key={leave.id} className="history-card">
                <div className="history-main">
                  <span className="reason-text">{leave.reason}</span>
                  <span className={`status-badge ${leave.status}`}>{leave.status}</span>
                </div>
                <div className="history-footer">
                  <Clock size={14} />
                  <span>{leave.from_date} to {leave.to_date}</span>
                </div>
              </div>
            )) : <p className="empty">No leave applications yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leave;
