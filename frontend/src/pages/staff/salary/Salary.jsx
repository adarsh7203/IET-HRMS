import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Download, Wallet, Calendar, FileText } from 'lucide-react';
import './Salary.css';

const Salary = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll/me');
      setPayrolls(response.data);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (slipId, monthName) => {
    try {
      const response = await api.get(`/payroll/download/${slipId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${monthName.replace(' ', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download payslip.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading Payslips...</div>;

  return (
    <div className="salary-wrapper">
      <div className="page-header">
        <h1>Payroll & Payslips</h1>
        <p>View your monthly salary breakdown and download slips.</p>
      </div>

      <div className="payslip-grid">
        {payrolls.length > 0 ? payrolls.map((slip) => (
          <div key={slip.id} className="payslip-card glass">
            <div className="slip-icon">
              <FileText size={24} />
            </div>
            <div className="slip-info">
              <h3>{slip.month}</h3>
              <div className="amount-row">
                <span>Final Salary:</span>
                <span className="amount">₹{slip.final_salary}</span>
              </div>
              <p className="deduction">Deductions: ₹{slip.deduction}</p>
            </div>
            <button 
              onClick={() => handleDownload(slip.id, slip.month)}
              className="download-btn"
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
          </div>
        )) : (
          <div className="empty-state glass">
            <Wallet size={48} />
            <p>No payslips generated yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salary;
