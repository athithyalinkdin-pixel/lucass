import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, ShoppingCart, User, X, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  const isHome = location.pathname === '/';
  const navTextColor = scrolled || !isHome ? 'text-primary' : 'text-white';

  return (
    <header className="fixed w-full z-50">
      {/* Top Banner (Hidden on scroll) */}
      <div
        className={`hidden md:block bg-primary text-white py-3 transition-all duration-500 ${
          scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'
        }`}
      >
        <div className="container mx-auto px-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center space-x-8">
            <span className="flex items-center gap-2">
              <Phone size={12} className="text-secondary" />
              +91 98413 10443
            </span>
            <span className="flex items-center gap-2 text-lowercase">
              <Mail size={12} className="text-secondary uppercase" />
              lucasagronaturalsmedia@gmail.com
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-3 h-3 bg-secondary rounded-full" />
            <div className="w-3 h-3 bg-secondary rounded-full" />
            <div className="w-3 h-3 bg-secondary rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md py-3 shadow-md'
            : 'bg-white/10 backdrop-blur-sm py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo & Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative w-12 h-12 md:w-14 md:h-14"
            >
              <img
                src="/assets/logo.png"
                alt="Lucas Agro Logo"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </motion.div>
            <div className="flex flex-col justify-center">
              <span
                className={`text-xl md:text-2xl font-black tracking-tighter font-sans leading-none ${
                  scrolled || !isHome ? 'text-primary' : 'text-white'
                }`}
              >
                LUCAS AGRO <span className="text-secondary">& NATURALS</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:text-secondary ${
                  location.pathname === link.path
                    ? 'text-secondary'
                    : scrolled || !isHome
                    ? 'text-primary'
                    : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icon Controls */}
          <div className="flex items-center space-x-6">
            {/* Cart Icon */}
            <Link to="/cart" className="relative group">
              <ShoppingCart
                className={`transition-colors ${navTextColor} group-hover:text-secondary`}
                size={22}
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Icon */}
            <Link
              to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
              className={`transition-colors ${navTextColor} hover:text-secondary`}
            >
              <User size={22} />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-1 ${navTextColor}`}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white overflow-hidden shadow-xl"
            >
              <div className="flex flex-col p-8 space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold uppercase tracking-widest ${
                      location.pathname === link.path ? 'text-secondary' : 'text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
