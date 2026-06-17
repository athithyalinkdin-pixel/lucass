import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const shippingCost = cartItems.reduce((total, item) => total + parseFloat(item.shipping_cost || 0) * item.qty, 0);
  const grandTotal = cartTotal + shippingCost;

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!(await loadRazorpayScript())) {
      alert('Razorpay SDK failed to load. Are you online?');
      setProcessing(false);
      return;
    }

    try {
      // 1. Create Razorpay order on backend with item IDs and quantities for server-side verification
      const { data: orderData } = await api.post('/orders/payment/create', {
        orderItems: cartItems.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
        currency: 'INR',
      });

      // 2. Open Razorpay Checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_yourkeyid', // Configurable key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Lucas Agro & Naturals',
        description: 'Natural Ayurvedic Health Solutions',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // 3. Verify payment signature on backend
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress,
              orderItems: cartItems.map((item) => ({
                id: item.id,
                qty: item.qty,
              }))
            };

            const { data: verifyData } = await api.post('/orders/payment/verify', verificationPayload);

            if (verifyData.success) {
              clearCart();
              navigate(`/order-success?id=${verifyData.orderId}`);
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#2F5233', // Forest green theme color
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error creating payment order:', err);
      // Check if backend returned a specific error message (e.g. stock limits)
      const errorMessage = err.response?.data?.message || 'Error creating payment order';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Checkout | Lucas Agro & Naturals</title>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <h1 className="text-4xl font-bold text-primary mb-12 italic font-serif">
          Secure Checkout
        </h1>

        <form onSubmit={handleCheckoutSubmit} className="grid lg:grid-cols-2 gap-12">
          {/* Left: Shipping Address form */}
          <div className="glass-card p-10">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3 font-serif">
              <MapPin className="text-secondary" />
              Shipping Information
            </h3>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-bold text-primary/60 mb-2">Full Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">Phone</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary/60 mb-2">Address</label>
                <textarea
                  required
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">City</label>
                  <input
                    required
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">State</label>
                  <input
                    required
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">Zip Code</label>
                  <input
                    required
                    name="zip"
                    value={shippingAddress.zip}
                    onChange={handleInputChange}
                    className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Summary Card */}
          <div>
            <div className="glass-card p-10 bg-primary text-white">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 font-serif">
                <CreditCard className="text-secondary" />
                Payment Summary
              </h3>

              <div className="space-y-4 mb-8 pb-8 border-b border-white/10 max-h-60 overflow-y-auto no-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="opacity-80">
                      {item.name} (x{item.qty})
                    </span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-bold mb-10 font-serif">
                <span>Total Amount</span>
                <span className="text-secondary">₹{grandTotal}</span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="btn-secondary w-full py-4 text-lg flex items-center justify-center gap-3 !bg-secondary !text-white border-none font-bold"
              >
                {processing ? (
                  'Processing...'
                ) : (
                  <>
                    <Lock size={20} />
                    <span>Pay Securely with Razorpay</span>
                  </>
                )}
              </button>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[10px] opacity-60">
                  <ShieldCheck size={16} />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-60">
                  <Lock size={16} />
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
