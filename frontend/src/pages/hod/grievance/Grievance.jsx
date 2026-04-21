import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { AlertTriangle, CheckCircle, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Grievance.css';

const Grievance = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get(`/grievance/department/${user.department_id}`);
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching grievances:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveGrievance = async (id) => {
    try {
      await api.put(`/grievance/${id}/resolve`);
      fetchComplaints();
    } catch (error) {
      alert("Failed to resolve grievance");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Grievances...</div>;

  return (
    <div className="hod-grievance-wrapper">
      <div className="page-header">
        <h1>Grievance Resolution</h1>
        <p>Listen to your staff's concerns and resolve them promptly.</p>
      </div>

      <div className="complaints-list">
        {complaints.length > 0 ? complaints.map((item) => (
          <div key={item.id} className={`complaint-card glass ${item.status}`}>
            <div className="complaint-main">
              <div className="complaint-icon">
                {item.status === 'pending' ? <AlertTriangle /> : <CheckCircle />}
              </div>
              <div className="complaint-body">
                <div className="complaint-info">
                  <span className="emp-tag"><small>#{item.employee_id}</small> {item.employee_name}</span>
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                </div>
                <p className="issue-text">{item.issue}</p>
              </div>
            </div>
            {item.status === 'pending' && (
              <button className="btn-primary" style={{marginTop: '16px'}} onClick={() => resolveGrievance(item.id)}>
                <CheckCircle size={18} /> Mark as Resolved
              </button>
            )}
          </div>
        )) : (
          <div className="empty-state glass">
            <MessageSquare size={48} />
            <p>No grievances filed in your department.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grievance;
