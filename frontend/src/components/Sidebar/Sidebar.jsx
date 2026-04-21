import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  FileText, 
  Wallet, 
  AlertTriangle,
  LogOut 
} from 'lucide-react';
import './Sidebar.css';

import logo from '../../assets/iet_logo.png';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const superAdminLinks = [
    { name: 'Dashboard', path: '/superadmin', icon: <LayoutDashboard size={20} /> },
    { name: 'Departments', path: '/superadmin/departments', icon: <Building2 size={20} /> },
    { name: 'Employees', path: '/superadmin/employees', icon: <Users size={20} /> },
    { name: 'Payroll', path: '/superadmin/payroll', icon: <Wallet size={20} /> },
    { name: 'Reports', path: '/superadmin/reports', icon: <FileText size={20} /> },
  ];

  const hodLinks = [
    { name: 'Dashboard', path: '/hod', icon: <LayoutDashboard size={20} /> },
    { name: 'Staff', path: '/hod/staff', icon: <Users size={20} /> },
    { name: 'Attendance', path: '/hod/attendance', icon: <CalendarCheck size={20} /> },
    { name: 'Leaves', path: '/hod/leave', icon: <FileText size={20} /> },
    { name: 'Grievances', path: '/hod/grievance', icon: <AlertTriangle size={20} /> },
  ];

  const staffLinks = [
    { name: 'Dashboard', path: '/staff', icon: <LayoutDashboard size={20} /> },
    { name: 'Attendance', path: '/staff/attendance', icon: <CalendarCheck size={20} /> },
    { name: 'Leaves', path: '/staff/leave', icon: <FileText size={20} /> },
    { name: 'Payroll', path: '/staff/salary', icon: <Wallet size={20} /> },
    { name: 'Complaints', path: '/staff/grievance', icon: <AlertTriangle size={20} /> },
  ];

  const links = user?.role === 'super_admin' ? superAdminLinks : 
                user?.role === 'hod' ? hodLinks : staffLinks;

  return (
    <aside className="sidebar glass">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <img src={logo} alt="IET Logo" className="iet-logo-img" />
        </div>
        <div className="brand-text">
          <span className="brand-main">IET</span>
          <span className="brand-sub">HRMS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink 
            key={link.path} 
            to={link.path} 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            end
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
