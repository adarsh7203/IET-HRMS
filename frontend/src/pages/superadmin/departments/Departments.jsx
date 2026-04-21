import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hod_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments/'),
        api.get('/employees/')
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        hod_id: formData.hod_id ? parseInt(formData.hod_id) : null
      };

      if (editId) {
        await api.put(`/departments/${editId}`, payload);
      } else {
        await api.post('/departments/', payload);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      alert("Action failed");
    }
  };

  const handleEdit = (dept) => {
    setEditId(dept.id);
    setFormData({
      name: dept.name,
      hod_id: dept.hod_id || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', hod_id: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        alert("Failed to delete department");
      }
    }
  };

  if (loading) return <div className="loading-spinner">Loading Departments...</div>;

  return (
    <div className="dept-wrapper">
      <div className="dept-header">
        <div>
          <h1>Departments</h1>
          <p>Manage college departments and assign HODs.</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="dept-grid">
        {departments.map((dept) => {
          const hod = employees.find(e => e.id === dept.hod_id);
          return (
            <div key={dept.id} className="dept-card glass">
              <div className="dept-icon">
                <Building2 size={24} />
              </div>
              <div className="dept-details">
                <h3>{dept.name}</h3>
                <p>HOD: {hod ? hod.name : 'Not Assigned'}</p>
              </div>
              <div className="dept-actions">
                <button className="action-btn edit" onClick={() => handleEdit(dept)}><Edit size={18} /></button>
                <button className="action-btn delete" onClick={() => handleDelete(dept.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{editId ? 'Edit Department' : 'Add New Department'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Department Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Computer Science"
                  required 
                />
              </div>
              <div className="input-group">
                <label>Assign HOD (Optional)</label>
                <select 
                  value={formData.hod_id}
                  onChange={(e) => setFormData({...formData, hod_id: e.target.value})}
                >
                  <option value="">Select HOD</option>
                  {employees.filter(e => e.role === 'hod').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
