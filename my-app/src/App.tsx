import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import SideNav from './sideNav';
import '././css/sidenav.css';
import DeficitStats from './pages/deficit';

// Define the NavItem type
interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

function App() {
  // Define navigation items
  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <Router>
      <div className="flex flex-row w-[100%]">
        <SideNav navItems={navItems} />
        <main className="content">
          <Routes>
            <Route path="/s" element={<Home />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path='/' element={ <DeficitStats /> } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;