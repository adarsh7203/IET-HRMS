import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { User, Mail, Briefcase, Hash, Info, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/Modal/Modal';
import './Staff.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchDepartmentStaff();
  }, []);

  const fetchDepartmentStaff = async () => {
    try {
      const response = await api.get(`/employees/department/${user.department_id}`);
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching department staff:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading Staff...</div>;

  return (
    <div className="hod-staff-wrapper">
      <div className="page-header">
        <h1>Department Staff</h1>
        <p>List of all employees working in your department.</p>
      </div>

      <div className="staff-grid">
        {staff.length > 0 ? staff.map((emp) => (
          <div key={emp.id} className="staff-card glass">
            <div className="staff-header">
              <div className="staff-avatar">
                {emp.name.charAt(0)}
              </div>
              <div className="staff-title">
                <h3>{emp.name}</h3>
                <span className="role-badge">{emp.role}</span>
              </div>
            </div>

            <div className="staff-details">
              <div className="detail-item">
                <Hash size={16} />
                <span>ID: {emp.id}</span>
              </div>
              <div className="detail-item">
                <Mail size={16} />
                <span>{emp.email}</span>
              </div>
              <div className="detail-item">
                <Briefcase size={16} />
                <span>₹{emp.salary.toLocaleString()}</span>
              </div>
            </div>
            <button className="btn-primary" style={{width: '100%', marginTop: '20px'}} onClick={() => setSelectedStaff(emp)}>
              <Info size={18} /> View Profile
            </button>
          </div>
        )) : (
          <div className="empty-state glass">
            <User size={48} />
            <p>No staff members found in your department.</p>
          </div>
        )}
      </div>

      <Modal 
        title="Employee Profile" 
        isOpen={!!selectedStaff} 
        onClose={() => setSelectedStaff(null)}
      >
        {selectedStaff && (
          <div className="staff-profile-details">
            <div className="profile-hero">
              <div className="hero-avatar">{selectedStaff.name[0]}</div>
              <div className="hero-info">
                <h3>{selectedStaff.name}</h3>
                <p>{selectedStaff.role} - ID #{selectedStaff.id}</p>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-box glass">
                <Mail size={18} />
                <span>{selectedStaff.email}</span>
              </div>
              <div className="info-box glass">
                <Calendar size={18} />
                <span>Joined: 12 Jan 2024</span>
              </div>
            </div>
            <div className="stats-mini">
              <div className="mini-stat">
                <label>Attendance</label>
                <p>{selectedStaff.attendance_percentage?.toFixed(1)}%</p>
              </div>
              <div className="mini-stat">
                <label>Leaves Left</label>
                <p>{selectedStaff.leaves_left} Days</p>
              </div>
            </div>
            <div className="modal-actions" style={{display: 'flex', justifyContent: 'center'}}>
              <button className="btn-secondary" style={{minWidth: '200px'}} onClick={() => setSelectedStaff(null)}>Close Profile</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Staff;
