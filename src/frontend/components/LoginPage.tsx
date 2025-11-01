import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const result = await api.login(username, password);
      if (result.success && result.user && result.token) {
        localStorage.setItem('gummybear_token', result.token);
        onLogin(username, password);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    setSuccess('');
    
    try {
      const result = await api.register(username, password);
      if (result.success && result.user && result.token) {
        setSuccess(result.message || 'Account created successfully!');
        localStorage.setItem('gummybear_token', result.token);
        setTimeout(() => {
    onLogin(username, password);
        }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-base-100 flex items-center justify-center overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-300/20 via-base-100 to-base-200/20"></div>
      
      {/* Spotlight effect */}
      <motion.div
        className="absolute inset-0 opacity-0 dark:opacity-100"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--p) / 0.15), transparent 40%)`
        }}
        transition={{ type: "spring", stiffness: 50, damping: 50 }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--bc)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--bc)/0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-3">
              <span className="text-primary">
                🛡️ ChromeOS Vulnerability Tester
              </span>
            </h1>
            <p className="text-base-content/70">Advanced AI-Powered Exploit Discovery Platform</p>
          </motion.div>

          {/* Tabs */}
          <div className="tabs tabs-boxed justify-center mb-6 bg-base-200/50 backdrop-blur-sm">
            <button
              className={`tab tab-lg ${activeTab === 'login' ? 'tab-active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccess('');
              }}
            >
              Login
            </button>
            <button
              className={`tab tab-lg ${activeTab === 'signup' ? 'tab-active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setError('');
                setSuccess('');
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Login/Signup Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-base-200/70 border border-base-300 rounded-2xl p-8 shadow-xl backdrop-blur-lg">
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="login-username" className="block text-sm font-medium text-base-content mb-2">
                  Username
                      </label>
                      <input
                        id="login-username"
                        type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                        className="input input-bordered w-full bg-base-100"
                        required
                />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="login-password" className="block text-sm font-medium text-base-content mb-2">
                  Password
                      </label>
                      <input
                        id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                        className="input input-bordered w-full bg-base-100"
                        required
                      />
                    </motion.div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="alert alert-error"
                      >
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn btn-primary w-full"
                    >
                      {loading ? <span className="loading loading-spinner"></span> : 'Login'}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSignUp}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="signup-username" className="block text-sm font-medium text-base-content mb-2">
                        Username
                      </label>
                      <input
                        id="signup-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username (min 3 characters)"
                        className="input input-bordered w-full bg-base-100"
                        required
                        minLength={3}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="signup-password" className="block text-sm font-medium text-base-content mb-2">
                        Password
                      </label>
                      <input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a password (min 6 characters)"
                        className="input input-bordered w-full bg-base-100"
                        required
                        minLength={6}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="signup-confirm" className="block text-sm font-medium text-base-content mb-2">
                        Confirm Password
                      </label>
                      <input
                        id="signup-confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="input input-bordered w-full bg-base-100"
                        required
                      />
                    </motion.div>

              {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="alert alert-error"
                      >
                        <span>{error}</span>
                      </motion.div>
              )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="alert alert-success"
                      >
                        <span>{success}</span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn btn-primary w-full"
                    >
                      {loading ? <span className="loading loading-spinner"></span> : 'Create Account'}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {[
              { icon: '🔍', title: 'Exploit Discovery', desc: 'AI-powered analysis' },
              { icon: '🛡️', title: 'ChromeOS', desc: 'Specialized testing' },
              { icon: '⚡', title: 'Real-time', desc: 'Live detection' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-base-200/70 border border-base-300 rounded-lg p-4 text-center shadow-lg backdrop-blur-sm">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-xs font-bold text-base-content">{feature.title}</div>
                  <div className="text-xs text-base-content/60 mt-1">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
