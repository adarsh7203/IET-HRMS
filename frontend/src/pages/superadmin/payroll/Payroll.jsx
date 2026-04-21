import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Wallet, Calendar, Users, CheckCircle, AlertCircle, Search, Download, Filter } from 'lucide-react';
import './Payroll.css';

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('April 2026');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    try {
      const [empRes, payRes] = await Promise.all([
        api.get('/employees/'),
        api.get(`/payroll/month/${month}`)
      ]);
      setEmployees(empRes.data);
      setPayrolls(payRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!window.confirm(`Generate payroll for ${month}?`)) return;
    try {
      setLoading(true);
      await api.post(`/payroll/bulk-generate?month_str=${month}`);
      fetchData();
    } catch (error) {
      alert("Failed to generate payroll. Ensure the month is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (slipId, empName, monthName) => {
    try {
      const response = await api.get(`/payroll/download/${slipId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${empName.replace(' ', '_')}_${monthName.replace(' ', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download payslip.");
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const processedCount = payrolls.length;
  const pendingCount = employees.length - processedCount;

  if (loading && employees.length === 0) return <div className="loading-spinner">Initializing Payroll...</div>;

  return (
    <div className="admin-payroll-wrapper">
      <div className="page-header">
        <h1>Payroll Management</h1>
        <p>Centralized salary processing for all department staff.</p>
      </div>

      {/* Stats Summary Bar */}
      <div className="payroll-stats-bar">
        <div className="stat-mini-card glass">
          <Users size={20} color="#6366f1" />
          <div className="stat-mini-info">
            <span>Total Staff</span>
            <strong>{employees.length}</strong>
          </div>
        </div>
        <div className="stat-mini-card glass">
          <CheckCircle size={20} color="#10b981" />
          <div className="stat-mini-info">
            <span>Processed</span>
            <strong>{processedCount}</strong>
          </div>
        </div>
        <div className="stat-mini-card glass">
          <AlertCircle size={20} color="#f59e0b" />
          <div className="stat-mini-info">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="payroll-action-bar glass">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="action-group">
          <div className="custom-select-wrapper">
            <Calendar size={16} />
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="April 2026">April 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>
          <button className="btn-primary-small" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Processing...' : 'Run Payroll'}
          </button>
        </div>
      </div>

      <div className="payroll-table-container glass">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee Details</th>
              <th>Base Pay</th>
              <th>Deductions</th>
              <th>Final Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? filteredEmployees.map(emp => {
              const slip = payrolls.find(p => p.employee_id === emp.id);
              return (
                <tr key={emp.id}>
                  <td>
                    <div className="emp-info-cell">
                      <div className="emp-avatar">{emp.name.charAt(0)}</div>
                      <div className="emp-text">
                        <div className="emp-name">{emp.name}</div>
                        <div className="emp-email">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>₹{emp.salary.toLocaleString()}</td>
                  <td>
                    <span className={slip?.deduction > 0 ? 'text-danger' : ''}>
                      ₹{(slip?.deduction || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="net-pay-cell">
                    ₹{(slip?.final_salary || emp.salary).toLocaleString()}
                  </td>
                  <td>
                    {slip ? (
                      <span className="status-pill success">
                        <CheckCircle size={12} /> Generated
                      </span>
                    ) : (
                      <span className="status-pill warning">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    {slip && (
                      <button 
                        onClick={() => handleDownload(slip.id, emp.name, slip.month)}
                        className="row-action-btn" 
                        title="Download Slip"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="table-empty">No staff members found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Add missing icon
const Clock = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default Payroll;
