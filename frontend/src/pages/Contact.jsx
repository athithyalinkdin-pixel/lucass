import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'Product Inquiry', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.post('/contact', formData);
      setStatus({ type: 'success', message: 'Your message has been sent successfully. We will get back to you shortly!' });
      setFormData({ name: '', email: '', phone: '', subject: 'Product Inquiry', message: '' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
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
          {/* Info Side */}
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-8 italic">Get in Touch</h1>
            <p className="text-lg text-primary/60 mb-12 max-w-md">
              Have questions about our products or your health journey? Our experts are here to help.
            </p>

            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-secondary">
                  <MapPin />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1 uppercase tracking-widest text-xs opacity-40">Office</h4>
                  <p className="text-lg font-bold text-primary">Chennai, Tamil Nadu, India</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-secondary">
                  <Phone />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1 uppercase tracking-widest text-xs opacity-40">Call Us</h4>
                  <p className="text-lg font-bold text-primary">9841310443</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center text-secondary">
                  <Mail />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1 uppercase tracking-widest text-xs opacity-40">Email</h4>
                  <p className="text-lg font-bold text-primary flex items-center break-all">lucasagronaturalsmedia@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-12"
          >
            <h3 className="text-2xl font-bold text-primary mb-8 italic">Send a Message</h3>
            
            {status.message && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {status.type === 'success' && <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Name</label>
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Email</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" placeholder="Your phone number" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Subject</label>
                  <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary">
                    <option>Product Inquiry</option>
                    <option>Order Support</option>
                    <option>General Feedback</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-primary/40 uppercase mb-2 ml-1">Message</label>
                <textarea required rows="4" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" placeholder="How can we help you?" />
              </div>
              
              <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 py-4 disabled:opacity-70">
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
