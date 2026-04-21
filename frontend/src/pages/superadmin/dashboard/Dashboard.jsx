import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Users, Building2, FileText, AlertTriangle, Wallet } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/superadmin');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-spinner">Loading Stats...</div>;

  const statCards = [
    { label: 'Total Departments', value: stats?.total_departments, icon: <Building2 />, color: '#6366f1' },
    { label: 'Total Employees', value: stats?.total_employees, icon: <Users />, color: '#10b981' },
    { label: 'Pending Leaves', value: stats?.total_leaves, icon: <FileText />, color: '#f59e0b' },
    { label: 'Open Grievances', value: stats?.total_grievances, icon: <AlertTriangle />, color: '#ef4444' },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <p>Overview of all college departments and staff.</p>
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
        <div className="content-card glass">
          <h2>Recent Activity</h2>
          <div className="empty-state">No recent activity found.</div>
        </div>
        <div className="content-card glass">
          <h2>Payroll Summary</h2>
          <div className="payroll-total">
            <Wallet size={40} color="#10b981" />
            <div>
              <p>Total Disbursed This Month</p>
              <h3>₹{stats?.total_payroll || 0}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
