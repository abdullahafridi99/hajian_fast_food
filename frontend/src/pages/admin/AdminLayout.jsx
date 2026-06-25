import React, { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  FiGrid,
  FiShoppingBag,
  FiFolder,
  FiList,
  FiGift,
  FiImage,
  FiMessageSquare,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

const AdminLayout = () => {
  const { admin, loading, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', label: 'Overview', icon: <FiGrid className="w-4 h-4" />, end: true },
    { path: '/admin/orders', label: 'Orders', icon: <FiShoppingBag className="w-4 h-4" /> },
    { path: '/admin/categories', label: 'Categories', icon: <FiFolder className="w-4 h-4" /> },
    { path: '/admin/foods', label: 'Foods CRUD', icon: <FiList className="w-4 h-4" /> },
    { path: '/admin/deals', label: 'Deals CRUD', icon: <FiGift className="w-4 h-4" /> },
    { path: '/admin/gallery', label: 'Gallery CRUD', icon: <FiImage className="w-4 h-4" /> },
    { path: '/admin/testimonials', label: 'Reviews Moderate', icon: <FiMessageSquare className="w-4 h-4" /> },
    { path: '/admin/payments', label: 'Payment Settings', icon: <FiCreditCard className="w-4 h-4" /> },
    { path: '/admin/settings', label: 'Brand Settings', icon: <FiSettings className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-light space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-500 font-bold font-sans">Checking credentials...</span>
      </div>
    );
  }

  if (!admin) {
    return null; // will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-light flex flex-col md:flex-row">
      
      {/* 1. Sidebar Nav */}
      <aside className="w-full md:w-64 bg-dark text-white flex-shrink-0 flex flex-col border-r border-white/5">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link to="/" className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-primary">
              {settings.restaurantName}
            </span>
            <span className="text-[9px] tracking-widest text-secondary font-bold -mt-0.5 uppercase">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Window */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Dashboard Top bar */}
        <header className="bg-white border-b border-light-gray/25 h-16 flex items-center justify-between px-8 shadow-sm">
          <h2 className="font-extrabold text-dark text-sm uppercase tracking-wider">
            Restaurant Operations
          </h2>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FiUser className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-dark uppercase">{admin.username}</span>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
