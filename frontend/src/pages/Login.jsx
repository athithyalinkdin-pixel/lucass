import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white flex items-center justify-center">
      <Helmet>
        <title>Login | Lucas Agro & Naturals</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 w-full max-w-md mx-4"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/5 text-secondary rounded-full mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary italic font-serif">Welcome Back</h1>
          <p className="text-primary/60 text-sm">Sign in to manage your health journey.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
              <input
                required
                type="email"
                placeholder="your@email.com"
                className="w-full bg-bg-off-white border border-accent rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-bg-off-white border border-accent rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 font-bold"
          >
            <span>{loading ? 'Signing in...' : 'Login'}</span>
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-accent text-center">
          <p className="text-sm text-primary/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
