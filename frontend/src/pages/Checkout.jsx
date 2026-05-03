import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, MapPin, CreditCard } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const { data: orderData } = await api.post('/orders/payment/create', {
        amount: cartTotal,
        currency: 'INR'
      });

      // 2. Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_fallback', // Enter the Key ID generated from the Dashboard
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Lucas Agro & Naturals',
        description: 'Natural Ayurvedic Health Solutions',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // 3. Verify payment on backend
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: formData,
              orderItems: cartItems.map(item => ({ id: item.id, price: item.price, qty: item.qty })),
              totalPrice: cartTotal
            };

            const { data: verifyRes } = await api.post('/orders/payment/verify', verifyData);

            if (verifyRes.success) {
              clearCart();
              navigate(`/order-success?id=${verifyRes.orderId}`);
            }
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#2F5233'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('Error creating payment order');
    } finally {
      setLoading(false);
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
        <h1 className="text-4xl font-bold text-primary mb-12 italic">Secure Checkout</h1>

        <form onSubmit={handlePayment} className="grid lg:grid-cols-2 gap-12">
          {/* Shipping Form */}
          <div className="glass-card p-10">
            <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <MapPin className="text-secondary" />
              Shipping Information
            </h3>
            
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-bold text-primary/60 mb-2">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">Phone</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary/60 mb-2">Address</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">City</label>
                  <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">State</label>
                  <input required name="state" value={formData.state} onChange={handleChange} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary/60 mb-2">Zip</label>
                  <input required name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-bg-off-white border border-accent rounded-xl px-4 py-3 focus:outline-none focus:border-secondary" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <div className="glass-card p-10 bg-primary text-white">
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <CreditCard className="text-secondary" />
                Payment Summary
              </h3>
              
              <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="opacity-80">{item.name} (x{item.qty})</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-2xl font-bold mb-10">
                <span>Total Amount</span>
                <span className="text-secondary">₹{cartTotal}</span>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="btn-secondary w-full py-4 text-lg flex items-center justify-center gap-3 !bg-secondary !text-white border-none"
              >
                {loading ? 'Processing...' : (
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
