import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-bg-off-white">
      <Helmet>
        <title>Your Cart | Lucas Agro & Naturals</title>
      </Helmet>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-primary mb-12 italic">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] shadow-premium">
            <div className="flex justify-center text-primary/10 mb-6">
              <ShoppingBag size={100} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Your cart is empty</h2>
            <p className="text-primary/60 mb-8">Looks like you haven't added any natural solutions yet.</p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-24 h-24 bg-accent/20 rounded-2xl flex items-center justify-center text-secondary/20">
                      <ShoppingBag size={40} />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-xl font-bold text-primary mb-1">{item.name}</h3>
                      <p className="text-secondary font-bold mb-4">₹{item.price}</p>
                      
                      <div className="flex items-center justify-center sm:justify-start space-x-4">
                        <div className="flex items-center border border-accent rounded-full bg-white px-3 py-1">
                          <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 text-primary">
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-bold">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 text-primary">
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xl font-bold text-primary">₹{item.price * item.qty}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-8 sticky top-32">
                <h3 className="text-2xl font-bold text-primary mb-8">Order Summary</h3>
                <div className="space-y-4 mb-8 pb-8 border-b border-accent">
                  <div className="flex justify-between text-primary/60">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                </div>
                <div className="flex justify-between text-2xl font-bold text-primary mb-8">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
                <Link 
                  to="/checkout" 
                  className="btn-primary w-full flex items-center justify-center space-x-3"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={20} />
                </Link>
                <div className="mt-6 text-center">
                  <p className="text-xs text-primary/40 italic">
                    Secure payment powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
