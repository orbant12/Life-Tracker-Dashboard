// SideNav.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


// Define types for props
interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface SideNavProps {
  navItems?: NavItem[];
}

const SideNav: React.FC<SideNavProps> = ({ navItems = [] }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleNav = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidenav-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggleNav}>
        {isOpen ? '←' : '→'}
      </button>
      <nav className="sidenav">
        <div className="sidenav-header">
          <h3 className='font-bold'>Tom Dashboard</h3>
        </div>
        <ul className="sidenav-items">
          {navItems.map((item, index) => (
            <li key={index} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path}>
                {item.icon && <span className="icon">{item.icon}</span>}
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;