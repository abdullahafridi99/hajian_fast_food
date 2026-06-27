import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { FiShoppingCart, FiMenu, FiX, FiLock, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { admin, logout, customer, customerLogout, setShowLoginModal } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/menu', label: 'Menu' },
    { path: '/deals', label: 'Deals' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/testimonials', label: 'Testimonials' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass shadow-md border-b border-light-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-primary">
                {settings.restaurantName}
              </span>
              <span className="text-[10px] tracking-widest text-secondary-dark font-semibold -mt-1 uppercase">
                {settings.slogan}
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-all duration-200 hover:text-primary ${
                    isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-dark/80'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User Controls & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-dark hover:text-primary transition-colors">
              <FiShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {admin ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 text-xs bg-dark text-white py-1.5 px-3 rounded-full hover:bg-dark-light transition-colors font-medium"
                >
                  <FiLock className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-dark hover:text-primary transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : customer ? (
              <div className="flex items-center space-x-3 bg-primary/10 border border-primary/20 py-1.5 px-3 rounded-full">
                <span className="text-xs font-black text-primary">
                  📞 {customer.phoneNumber}
                </span>
                <button
                  onClick={customerLogout}
                  className="p-1 text-gray-500 hover:text-primary transition-colors"
                  title="Logout Customer"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-xs font-black uppercase tracking-wider py-1.5 px-4 bg-primary text-white rounded-full hover:bg-secondary hover:text-dark transition-all duration-300 shadow-sm"
                >
                  Sign In
                </button>
                <Link
                  to="/admin/login"
                  className="text-[10px] text-dark/40 hover:text-primary transition-colors font-bold uppercase tracking-wider"
                  title="Admin Access"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart and Menu button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link to="/cart" className="relative p-2 text-dark hover:text-primary transition-colors">
              <FiShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark p-2 focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-light-gray/20">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-semibold ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-dark/80 hover:bg-primary/5 hover:text-primary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2 border-dark/10" />
            {admin ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold text-dark/80 hover:bg-primary/5 hover:text-primary"
                >
                  <FiLock className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold text-primary hover:bg-primary/5"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : customer ? (
              <>
                <div className="px-3 py-2 text-sm font-bold text-dark/60">
                  Logged in: <span className="text-primary">{customer.phoneNumber}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    customerLogout();
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold text-primary hover:bg-primary/5"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold text-primary hover:bg-primary/5"
                >
                  👤 Sign In / Register
                </button>
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-semibold text-dark/40 hover:text-primary"
                >
                  <FiLock className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>

  );
};

export default Navbar;
