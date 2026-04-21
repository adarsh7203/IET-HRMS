import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Search, Calendar, UserCheck, UserX, Info, Clock, MapPin, Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/Modal/Modal';
import './Attendance.css';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDepartmentAttendance();
  }, []);

  const fetchDepartmentAttendance = async () => {
    try {
      const response = await api.get(`/attendance/department/${user.department_id}`);
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching department attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading Attendance Records...</div>;

  return (
    <div className="hod-attendance-wrapper">
      <div className="page-header">
        <h1>Attendance Review</h1>
        <p>Monitor daily attendance records for all department staff.</p>
      </div>

      <div className="table-container glass">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length > 0 ? attendance.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="emp-info">
                    <span className="emp-id">#{record.employee_id} {record.employee_name}</span>
                  </div>
                </td>
                <td>{record.date}</td>
                <td>
                  <span className={`status-pill ${record.status}`}>
                    {record.status === 'present' ? <UserCheck size={14} /> : <UserX size={14} />}
                    {record.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => setSelectedRecord(record)}>
                    <Eye size={16} /> View Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="empty-row">No attendance records found for this department.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        title="Attendance Evidence" 
        isOpen={!!selectedRecord} 
        onClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <div className="attendance-details">
            <div className="detail-row">
              <Clock className="icon" />
              <div>
                <label>Time of Entry</label>
                <p>09:15 AM (System Log)</p>
              </div>
            </div>
            <div className="detail-row">
              <MapPin className="icon" />
              <div>
                <label>Location</label>
                <p>Main Campus, North Block (Geo-fenced)</p>
              </div>
            </div>
            <div className="detail-row">
              <Info className="icon" />
              <div>
                <label>Verification</label>
                <p>Face Match: 98.4% (Verified)</p>
              </div>
            </div>
            <div className="evidence-placeholder glass">
              <p>Face-Recognition Snapshot would appear here.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" style={{flex: 1}} onClick={() => setSelectedRecord(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Attendance;
