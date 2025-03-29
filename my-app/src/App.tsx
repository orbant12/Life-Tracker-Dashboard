import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/home';
import SideNav from './sideNav';
import '././css/sidenav.css';
import DeficitStats from './pages/deficit';
import LogNew  from './pages/addNew';

// Define the NavItem type with optional children for dropdown items
interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

function App() {
  // Define navigation items with children for Nutrition dropdown
  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: '🏠' },
    { 
      path: '/nutrition', 
      label: 'Nutrition', 
      icon: '🍏',
      children: [
        { path: '/nutrition/lognew', label: '+ Log New' },
        { path: '/nutrition/tracking', label: 'Tracking' },
        { path: '/nutrition/recipes', label: 'Recipes' }
      ] 
    },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <Router>
      <div className="flex flex-row w-full h-[100vh]">
        <SideNav navItems={navItems} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            <Route path="/nutrition/lognew" element={ <LogNew /> } />
            <Route path="/nutrition/macros" element={<div>Macro Tracking Page</div>} />
            <Route path="/nutrition/recipes" element={<div>Recipes Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path='/nutrition/tracking' element={<DeficitStats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;