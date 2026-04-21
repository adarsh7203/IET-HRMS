import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Plus, Edit, Trash2, User, Mail, Briefcase } from 'lucide-react';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department_id: '',
    salary: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees/'),
        api.get('/departments/')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/employees/${editId}`, formData);
      } else {
        await api.post('/employees/', formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      alert("Action failed: " + (error.response?.data?.detail || "Unknown error"));
    }
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '', // Password not editable here for security
      role: emp.role,
      department_id: emp.department_id || '',
      salary: emp.salary
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', email: '', password: '', role: 'staff', department_id: '', salary: 0 });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        fetchData();
      } catch (error) {
        alert("Failed to delete employee");
      }
    }
  };

  if (loading) return <div className="loading-spinner">Loading Employees...</div>;

  return (
    <div className="emp-wrapper">
      <div className="emp-header">
        <div>
          <h1>Employee Management</h1>
          <p>View and manage all faculty and staff members.</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="emp-table-container glass">
        <table className="emp-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div className="user-info">
                    <div className="avatar">{emp.name[0]}</div>
                    <div>
                      <div className="name">{emp.name}</div>
                      <div className="email">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`role-badge ${emp.role}`}>{emp.role.replace('_', ' ')}</span></td>
                <td>{departments.find(d => d.id === emp.department_id)?.name || 'N/A'}</td>
                <td>₹{emp.salary}</td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn edit" onClick={() => handleEdit(emp)}><Edit size={16} /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(emp.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{editId ? 'Edit Employee' : 'Add New Employee'}</h2>
            <form onSubmit={handleSubmit} className="emp-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                {!editId && (
                  <div className="input-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                    />
                  </div>
                )}
                <div className="input-group">
                  <label>Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="staff">Staff / Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select 
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Base Salary</label>
                  <input 
                    type="number" 
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
