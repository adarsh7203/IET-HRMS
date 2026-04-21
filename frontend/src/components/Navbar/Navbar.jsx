import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar glass">
      <div className="navbar-brand-mobile">
        <span>IET HRMS</span>
      </div>

      <div className="nav-actions">
        <button className="icon-btn glass">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role.replace('_', ' ')}</span>
          </div>
          <div className="user-avatar">
            {user?.name[0]}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
