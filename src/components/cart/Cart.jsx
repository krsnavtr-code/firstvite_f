import React, { useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    cartSummary,
    toggleCart,
    removeFromCart,
    clearCart,
  } = useCart();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cartVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'tween', duration: 0.3 } },
    exit: { x: '100%', transition: { type: 'tween', duration: 0.3 } },
  };

  if (!isCartOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
        onClick={toggleCart}
      />
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto dark:bg-gray-800"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cartVariants}
      >
        <div className="p-6 h-full flex flex-col dark:bg-gray-800">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Cart ({totalItems})</h2>
            <button
              onClick={toggleCart}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto dark:bg-gray-800">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart size={48} className="mb-4" />
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Start adding some items to your cart</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 border-b">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                      <img
                        src={getImageUrl(item.image || item.thumbnail)}
                        alt={item.title}
                        className="w-full h-full dark:bg-gray-700 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/course-placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.title}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm">${item.price.toFixed(2)}</p>
                      <p className="mt-1 font-medium">
                      ${item.price.toFixed(2)}
                    </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="mt-6 border-t pt-4 dark:bg-gray-800">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${cartSummary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${cartSummary.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Handle checkout
                    toast.success('Proceeding to checkout!');
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="w-full py-2 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Cart;
