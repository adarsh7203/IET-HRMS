import React from 'react';
import { BarChart3, PieChart, Download, FileSpreadsheet } from 'lucide-react';
import './Reports.css';

import api from '../../../services/api';

const Reports = () => {
  const exportReport = async (type, filename) => {
    try {
      const response = await api.get(`/reports/${type}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert(`Failed to export ${type} report.`);
    }
  };

  return (
    <div className="reports-wrapper">
      <div className="page-header">
        <h1>College Reports</h1>
        <p>Generate and export HR insights and department performance data.</p>
      </div>

      <div className="reports-grid">
        <div className="report-card glass">
          <div className="report-icon">
            <BarChart3 size={32} />
          </div>
          <h3>Attendance Summary</h3>
          <p>Monthly attendance trends across all departments.</p>
          <button className="export-btn" onClick={() => exportReport('attendance/csv', 'Attendance_Summary.csv')}>
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="report-card glass">
          <div className="report-icon">
            <PieChart size={32} />
          </div>
          <h3>Budget Analysis</h3>
          <p>Payroll distribution and department expenses.</p>
          <button className="export-btn" onClick={() => exportReport('budget/pdf', 'Budget_Analysis.pdf')}>
            <Download size={18} /> Export PDF
          </button>
        </div>

        <div className="report-card glass">
          <div className="report-icon">
            <FileSpreadsheet size={32} />
          </div>
          <h3>Staff Turnover</h3>
          <p>Employee retention and recruitment statistics.</p>
          <button className="export-btn" onClick={() => exportReport('turnover/excel', 'Staff_Report.csv')}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>
      
      <div className="coming-soon glass">
        <h2>Advanced Analytics Dashboard</h2>
        <p>Real-time visual insights are currently being integrated. Stay tuned!</p>
      </div>
    </div>
  );
};

export default Reports;
