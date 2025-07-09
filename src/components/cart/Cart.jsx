import React, { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import {
  X,
  Trash2,
  ShoppingCart,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { submitContactForm } from "../../api/contactApi";
import { getImageUrl } from "../../utils/imageUtils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    courseInterests: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    cartSummary,
    toggleCart,
    removeFromCart,
    clearCart,
    isInCart,
  } = useCart();

  const handleProceedToCheckout = () => {
    setShowCheckoutOptions(true);
  };

  const handleContactTeam = () => {
    setShowCheckoutOptions(false);
    // Small delay for smooth transition
    setTimeout(() => setShowContactForm(true), 50);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        courseInterests: checked
          ? [...prev.courseInterests, value]
          : prev.courseInterests.filter((courseId) => courseId !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the data to send
      const formDataToSubmit = {
        ...formData,
        courseInterests: items
          .filter((item) => formData.courseInterests.includes(item.id))
          .map((item) => item.id),
      };

      await submitContactForm(formDataToSubmit);

      toast.success("Our team will contact you shortly!");
      setShowContactForm(false);
      setShowCheckoutOptions(false);
      toggleCart();

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        courseInterests: [],
      });
    } catch (error) {
      const errorMessage =
        error.message || "Failed to submit your request. Please try again.";
      toast.error(errorMessage);
      console.error("Error submitting contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = () => {
    // TODO: Implement payment processing
    toast.success("Redirecting to payment gateway...");
    setShowCheckoutOptions(false);
    toggleCart();
  };

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cartVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "tween", duration: 0.3 } },
    exit: { x: "100%", transition: { type: "tween", duration: 0.3 } },
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCheckoutOptions(false);
              toggleCart();
            }}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto dark:bg-gray-800"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cartVariants}
            onClick={(e) => e.stopPropagation()}
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
                    <p className="text-sm mt-2">
                      Start adding some items to your cart
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {items.map((item, index) => (
                      <li
                        key={`${item.id}-${index}`}
                        className="flex gap-4 py-4 border-b"
                      >
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                          <img
                            src={getImageUrl(item.image || item.thumbnail)}
                            alt={item.title}
                            className="w-full h-full dark:bg-gray-700 object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/course-placeholder.jpg";
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
                          <p className="text-gray-600 text-sm">
                            ${item.price.toFixed(2)}
                          </p>
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
                      onClick={handleProceedToCheckout}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to clear your cart?"
                          )
                        ) {
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
      )}

      {/* Contact Form Modal */}
      {/* <AnimatePresence>
        {showContactForm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">
                  Contact Our Team
                </h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interested in:
                  </label>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`course-${item.id}`}
                          name="courseInterests"
                          value={item.id}
                          checked={formData.courseInterests.includes(item.id)}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor={`course-${item.id}`}
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {item.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Checkout Options Modal */}
      {/* <AnimatePresence>
        {showCheckoutOptions && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCheckoutOptions(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6 text-center dark:text-white">
                Choose Checkout Option
              </h3>

              <div className="space-y-4">
                <button
                  onClick={handleContactTeam}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Contact Our Team</span>
                </button>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Payment</span>
                </button>
              </div>

              <button
                onClick={() => setShowCheckoutOptions(false)}
                className="mt-6 w-full py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </AnimatePresence>
  );
};

export default Cart;
