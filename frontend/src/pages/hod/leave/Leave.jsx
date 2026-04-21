import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Check, X, FileText, User, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Leave.css';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const fetchAllLeaves = async () => {
    try {
      const response = await api.get(`/leaves/department/${user.department_id}`);
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/${status}`);
      fetchAllLeaves();
    } catch (error) {
      alert(`Failed to ${status} leave`);
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const processedLeaves = leaves.filter(l => l.status !== 'pending');

  if (loading) return <div className="loading-spinner">Loading Leave Requests...</div>;

  return (
    <div className="hod-leave-wrapper">
      <div className="page-header">
        <h1>Leave Approvals</h1>
        <p>Review and manage leave applications from your department staff.</p>
      </div>

      <div className="leave-section">
        <h2>Pending Approvals</h2>
        <div className="leave-requests">
          {pendingLeaves.length > 0 ? pendingLeaves.map((leave) => (
            <div key={leave.id} className="leave-card glass">
              <div className="leave-user">
                <div className="user-avatar">{leave.employee_name ? leave.employee_name[0] : 'U'}</div>
                <div>
                  <h4><span className="id-tag">#{leave.employee_id}</span> {leave.employee_name}</h4>
                  <p className="reason">"{leave.reason}"</p>
                </div>
              </div>

              <div className="leave-dates">
                <div className="date-box">
                  <Calendar size={16} />
                  <span>{leave.from_date}</span>
                </div>
                <div className="arrow">→</div>
                <div className="date-box">
                  <Calendar size={16} />
                  <span>{leave.to_date}</span>
                </div>
              </div>

              <div className="leave-actions">
                <button className="btn-primary" onClick={() => handleStatus(leave.id, 'approve')}>
                  <Check size={18} /> Approve
                </button>
                <button className="btn-secondary" onClick={() => handleStatus(leave.id, 'reject')}>
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          )) : (
            <div className="empty-state glass">
              <FileText size={32} />
              <p>No pending leave requests found.</p>
            </div>
          )}
        </div>
      </div>

      <div className="leave-section" style={{marginTop: '60px'}}>
        <h2>Recent Decisions (History)</h2>
        <div className="leave-history-list">
          {processedLeaves.length > 0 ? processedLeaves.map((leave) => (
            <div key={leave.id} className={`history-item-mini glass ${leave.status}`}>
              <div className="history-info">
                <strong><span className="id-tag-mini">#{leave.employee_id}</span> {leave.employee_name}</strong>
                <p>{leave.from_date} to {leave.to_date}</p>
                <span className="reason-small">"{leave.reason}"</span>
              </div>
              <div className={`status-tag-mini ${leave.status}`}>
                {leave.status === 'approved' ? <Check size={14}/> : <X size={14}/>}
                {leave.status}
              </div>
            </div>
          )) : <p className="empty-text">No decision history yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Leave;
