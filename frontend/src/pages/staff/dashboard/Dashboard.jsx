import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { CalendarCheck, FileText, Wallet, AlertCircle, Send, MessageSquare, Download, CheckCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/staff');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-spinner">Loading Profile...</div>;

  const statCards = [
    { label: 'Attendance %', value: `${stats?.attendance_percentage.toFixed(1)}%`, icon: <CalendarCheck />, color: '#6366f1' },
    { label: 'Leaves Taken', value: stats?.leave_history_count, icon: <FileText />, color: '#ec4899' },
    { label: 'Recent Salary', value: stats?.recent_salary ? `₹${stats.recent_salary}` : 'N/A', icon: <Wallet />, color: '#10b981' },
    { label: 'New Notices', value: stats?.unread_notices, icon: <AlertCircle />, color: '#f59e0b' },
  ];

  const quickActions = [
    { title: "Mark Attendance", subtitle: "Record your presence", icon: <CheckCircle size={24} />, path: "/staff/attendance", color: "#6366f1" },
    { title: "Apply for Leave", subtitle: "Request time off", icon: <Send size={24} />, path: "/staff/leave", color: "#ec4899" },
    { title: "Raise Grievance", subtitle: "Report an issue", icon: <MessageSquare size={24} />, path: "/staff/grievance", color: "#f59e0b" },
    { title: "Download Payslip", subtitle: "View salary details", icon: <Download size={24} />, path: "/staff/salary", color: "#10b981" },
  ];

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Here's your employment summary for this month.</p>
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

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card glass" onClick={() => navigate(action.path)}>
              <div className="action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <div className="action-text">
                <h3>{action.title}</h3>
                <p>{action.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
