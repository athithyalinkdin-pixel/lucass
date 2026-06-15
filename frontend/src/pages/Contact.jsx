import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Check, Send } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product Inquiry',
    message: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/contact', formData);
      setStatus({
        type: 'success',
        message: 'Your message has been sent successfully. We will get back to you shortly!',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Product Inquiry',
        message: '',
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Contact Us | Lucas Agro & Naturals</title>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Contact Info */}
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-8 italic font-serif">Get in Touch</h1>
            <p className="text-lg text-primary/60 mb-12 max-w-md font-medium">
              Have questions about our products or your health journey? Our experts are here to help.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-secondary flex-shrink-0">
                  <MapPin />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1 uppercase tracking-widest text-xs opacity-40">Office</h4>
                  <p className="text-lg font-bold text-primary">Chennai, Tamil Nadu, India</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-secondary flex-shrink-0">
                  <Phone />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1 uppercase tracking-widest text-xs opacity-40">Call Us</h4>
                  <p className="text-lg font-bold text-primary">+91 98413 10443</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-secondary flex-shrink-0">
                  <Mail />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1 uppercase tracking-widest text-xs opacity-40">Email</h4>
                  <p className="text-lg font-bold text-primary flex items-center break-all">
                    lucasagronaturalsmedia@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-12 border border-accent/20"
          >
            <h3 className="text-2xl font-bold text-primary mb-8 italic font-serif">Send a Message</h3>
            
            {status.message && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {status.type === 'success' && <Check size={20} className="mt-0.5 flex-shrink-0" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Name</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary cursor-pointer"
                  >
                    <option>Product Inquiry</option>
                    <option>Order Support</option>
                    <option>General Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Message</label>
                <textarea
                  required
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4 disabled:opacity-70 font-bold"
              >
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
                {!loading && <Send size={20} />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
