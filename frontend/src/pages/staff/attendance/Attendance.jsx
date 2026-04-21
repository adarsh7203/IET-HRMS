import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';
import './Attendance.css';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markedToday, setMarkedToday] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/me');
      setHistory(response.data);
      
      const today = new Date().toISOString().split('T')[0];
      const hasMarked = response.data.some(a => a.date === today);
      setMarkedToday(hasMarked);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (status) => {
    try {
      await api.post('/attendance/mark', { status });
      setMarkedToday(true);
      fetchAttendance();
    } catch (error) {
      alert("Failed to mark attendance");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="attendance-wrapper">
      <div className="attendance-header">
        <h1>Attendance Management</h1>
        <p>Mark your daily presence and view history.</p>
      </div>

      <div className="attendance-action glass">
        <div className="action-info">
          <Clock size={40} color="#6366f1" />
          <div>
            <h3>Today: {new Date().toLocaleDateString()}</h3>
            <p>{markedToday ? "You have already marked your attendance today." : "Please mark your attendance to record your presence."}</p>
          </div>
        </div>
        {!markedToday && (
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => markAttendance('present')}>
              <CheckCircle size={20} /> Mark Present
            </button>
            <button className="btn-secondary" onClick={() => markAttendance('absent')}>
              <XCircle size={20} /> Mark Absent
            </button>
          </div>
        )}
      </div>

      <div className="history-section glass">
        <h2>Attendance History</h2>
        <div className="history-list">
          {history.length > 0 ? history.map((record) => (
            <div key={record.id} className="history-item">
              <div className="record-date">
                <Calendar size={18} />
                <span>{record.date}</span>
              </div>
              <span className={`status-tag ${record.status}`}>{record.status}</span>
            </div>
          )) : <p className="empty">No attendance records yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
