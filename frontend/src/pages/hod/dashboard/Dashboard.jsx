import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Users, CalendarCheck, FileText, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/hod');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-spinner">Loading Dept Stats...</div>;

  const statCards = [
    { label: 'Dept Staff', value: stats?.dept_staff, icon: <Users />, color: '#6366f1' },
    { label: 'Today Present', value: stats?.today_attendance, icon: <CalendarCheck />, color: '#10b981' },
    { label: 'Avg Attendance', value: `${stats?.attendance_percentage.toFixed(1)}%`, icon: <CalendarCheck />, color: '#8b5cf6' },
    { label: 'Pending Leaves', value: stats?.pending_leaves, icon: <FileText />, color: '#f59e0b' },
    { label: 'Open Grievances', value: stats?.open_grievances, icon: <AlertTriangle />, color: '#ef4444' },
  ];

  return (
    <div className="hod-dashboard">
      <div className="dashboard-header">
        <h1>Department Overview</h1>
        <p>Monitor your department's attendance, leaves, and staff performance.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card glass">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <div className="content-card glass approval-section">
          <div className="approval-header">
            <div className="header-icon">
              {stats?.pending_leaves > 0 ? (
                <div className="pulse-icon"><Clock size={24} /></div>
              ) : (
                <CheckCircle2 size={24} color="#10b981" />
              )}
            </div>
            <div className="header-text">
              <h2>Pending Approvals</h2>
              <p>Action required on staff requests</p>
            </div>
          </div>

          <div className="approval-body">
            {stats?.pending_leaves > 0 ? (
              <div className="pending-notice">
                <span className="count-badge">{stats.pending_leaves}</span>
                <p>New leave applications require your review.</p>
              </div>
            ) : (
              <p className="empty-text">Your department is all caught up! No pending requests.</p>
            )}
            
            <button className="btn-primary review-btn" onClick={() => navigate('/hod/leave')}>
              {stats?.pending_leaves > 0 ? 'Review Requests' : 'View History'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
