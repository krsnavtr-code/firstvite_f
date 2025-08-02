import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { loadRazorpay, initRazorpayPayment } from "../utils/razorpay";

const PaymentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    paymentAmount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Load Razorpay script when component mounts
  useEffect(() => {
    loadRazorpay().then((success) => {
      if (!success) {
        toast.error("Failed to load payment gateway. Please try again later.");
      }
      setIsRazorpayLoaded(success);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const initiateRazorpayPayment = async (orderData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "FirstVITE",
      description: `Payment for ${formData.course}`,
      order_id: orderData.id,
      handler: async function (response) {
        try {
          // Verify payment on the server
          const verifyResponse = await api.post("/payments/verify", {
            orderId: orderData.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            ...formData,
          });

          if (verifyResponse.data.success) {
            toast.success("Payment successful!");
            onClose();
            // Reset form
            setFormData({
              name: "",
              email: "",
              phone: "",
              course: "",
              paymentAmount: "",
            });
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Error verifying payment. Please contact support.");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#4F46E5",
      },
    };

    const paymentObject = initRazorpayPayment(options);
    if (!paymentObject) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    paymentObject.on("payment.failed", function (response) {
      toast.error(`Payment failed: ${response.error.description}`);
    });
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.course ||
      !formData.paymentAmount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      isNaN(formData.paymentAmount) ||
      parseFloat(formData.paymentAmount) <= 0
    ) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a Razorpay order
      const response = await api.post("/payments/create-order", {
        amount: parseFloat(formData.paymentAmount) * 100, // Convert to paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          course: formData.course,
          name: formData.name,
          email: formData.email,
        },
      });

      if (response.data.success) {
        await initiateRazorpayPayment(response.data.order);
      } else {
        throw new Error(
          response.data.message || "Failed to create payment order"
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to process payment";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="z-[9999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Make a Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700"
              >
                Course Name
              </label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="paymentAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Payment Amount (₹)
              </label>
              <input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex items-center space-x-1">
              {/* Checkbox for terms and conditions */}
              <input
                type="checkbox"
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
              <label
                htmlFor="terms"
                className="block text-sm font-medium text-gray-700"
              >
                I accept the payment <Link to="/payment-t-and-c">T&C</Link>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex justify-center py-1 px-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isRazorpayLoaded}
                className="flex justify-center py-1 px-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
