import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Updated NavItem interface to include optional children
interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface SideNavProps {
  navItems?: NavItem[];
}

const SideNav: React.FC<SideNavProps> = ({ navItems = [] }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const toggleNav = (): void => {
    setIsOpen(!isOpen);
  };

  // Toggle dropdown menu
  const toggleDropdown = (label: string): void => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  // Check if path or any child path is active
  const isPathActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
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
            <li key={index} className={isPathActive(item) ? 'active' : ''}>
              {item.children ? (
                // Render dropdown menu
                <div className="dropdown-wrapper">
                  <div 
                    className="dropdown-header" 
                    onClick={() => toggleDropdown(item.label)}
                  >
                    {item.icon && <span className="icon">{item.icon}</span>}
                    <span className="label">{item.label}</span>
                    <span className="dropdown-arrow">
                      {openDropdowns.includes(item.label) ? '▲' : '▼'}
                    </span>
                  </div>
                  
                  {openDropdowns.includes(item.label) && (
                    <ul className="dropdown-menu">
                      {item.children.map((child, childIndex) => (
                        <li 
                          key={childIndex} 
                          className={location.pathname === child.path ? 'active' : ''}
                        >
                          <Link to={child.path}>
                            <span className="label">{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Render regular link
                <Link to={item.path}>
                  {item.icon && <span className="icon">{item.icon}</span>}
                  <span className="label">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;