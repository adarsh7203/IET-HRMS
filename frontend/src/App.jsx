import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/login/Login';

import Dashboard from './pages/superadmin/dashboard/Dashboard';
import StaffDashboard from './pages/staff/dashboard/Dashboard';
import Attendance from './pages/staff/attendance/Attendance';
import StaffLeave from './pages/staff/leave/Leave';
import StaffSalary from './pages/staff/salary/Salary';
import StaffGrievance from './pages/staff/grievance/Grievance';
import HODDashboard from './pages/hod/dashboard/Dashboard';
import HODStaff from './pages/hod/staff/Staff';
import HODAttendance from './pages/hod/attendance/Attendance';
import HODLeave from './pages/hod/leave/Leave';
import HODGrievance from './pages/hod/grievance/Grievance';
import Departments from './pages/superadmin/departments/Departments';
import Employees from './pages/superadmin/employees/Employees';
import AdminPayroll from './pages/superadmin/payroll/Payroll';
import Reports from './pages/superadmin/reports/Reports';

// Layout Component
const DashboardLayout = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div style={{ flex: 1, marginLeft: '300px' }}>
      <Navbar />
      <main style={{ marginTop: '110px', padding: '0 40px 40px' }}>
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/superadmin" element={<Dashboard />} />
            <Route path="/superadmin/departments" element={<Departments />} />
            <Route path="/superadmin/employees" element={<Employees />} />
            <Route path="/superadmin/payroll" element={<AdminPayroll />} />
            <Route path="/superadmin/reports" element={<Reports />} />
          </Route>

          {/* HOD Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hod']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/hod" element={<HODDashboard />} />
            <Route path="/hod/staff" element={<HODStaff />} />
            <Route path="/hod/attendance" element={<HODAttendance />} />
            <Route path="/hod/leave" element={<HODLeave />} />
            <Route path="/hod/grievance" element={<HODGrievance />} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/attendance" element={<Attendance />} />
            <Route path="/staff/leave" element={<StaffLeave />} />
            <Route path="/staff/salary" element={<StaffSalary />} />
            <Route path="/staff/grievance" element={<StaffGrievance />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
