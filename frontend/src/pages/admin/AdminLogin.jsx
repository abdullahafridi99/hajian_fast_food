import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, token } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (token) {
      navigate('/admin');
    }
  }, [token, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || 'Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-light to-secondary/15 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      
      {/* Background glowing rings */}
      <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-accent/5 rounded-full blur-3xl -bottom-20 -right-20"></div>

      {/* Glassmorphic Card Container */}
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-[32px] border border-white/50 shadow-2xl relative z-10">
        
        {/* Title Block */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-center mx-auto text-primary mb-2">
            <FiLock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black text-dark tracking-tight">Admin Portal</h2>
          <p className="text-gray-500 text-xs uppercase tracking-wider font-extrabold">Hajian Foods Control Panel</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="mt-8 space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 text-xs font-bold flex items-start space-x-2 animate-shake">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminLogin;
