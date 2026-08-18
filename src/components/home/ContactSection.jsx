import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaPaperPlane,
  FaCheck,
  FaHeadset,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { submitContactForm } from "../../api/contactApi";
import { Link } from "react-router-dom";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreedToTerms) {
      toast.error("Please accept the terms & conditions and privacy policy");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        toast.success("Message sent successfully!");
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          agreedToTerms: false,
        });

        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        toast.error(
          result.message || "Failed to send message. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: (
        <FaMapMarkerAlt className="text-xl text-blue-600 dark:text-blue-400" />
      ),
      title: "Our Location",
      description: "G-25, Block G, Sector 3, Noida, Uttar Pradesh 201301",
      link: "https://maps.app.goo.gl/2q1X99HQBRMHJpBDA",
      linkText: "View on map",
    },
    {
      icon: (
        <FaPhone className="text-xl text-emerald-600 dark:text-emerald-400" />
      ),
      title: "Phone Number",
      description: "+91 9891030303",
      link: "tel:+919891030303",
      linkText: "Call us",
    },
    {
      icon: (
        <FaEnvelope className="text-xl text-purple-600 dark:text-purple-400" />
      ),
      title: "Email Address",
      description: "info@eklabya.com",
      link: "mailto:info@eklabya.com",
      linkText: "Send email",
    },
  ];

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3.5 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <FaHeadset className="text-xs" /> Get In Touch
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            We’d Love to Hear From You
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Have a question before you enroll? Send us a message and we'll
            respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Cards (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800/90 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all duration-300"
                whileHover={{ y: -3 }}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="flex-shrink-0 p-3 bg-slate-50 dark:bg-gray-700/60 rounded-xl border border-slate-100 dark:border-gray-700">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                    <a
                      href={item.link}
                      className="mt-2 inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {item.linkText}
                      <svg
                        className="w-3.5 h-3.5 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form (Col 8) */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800">
              {isSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                    <FaCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    Thank you for contacting us. We'll get back to you soon!
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-98"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Your Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      id="agreedToTerms"
                      name="agreedToTerms"
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                    <div className="text-xs">
                      <label
                        htmlFor="agreedToTerms"
                        className="font-medium text-slate-700 dark:text-slate-300"
                      >
                        I hereby agree to receive the promotional emails &
                        messages through WhatsApp/RCS/SMS{" "}
                        <Link
                          to="/terms-of-service"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          T&C
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy-policy"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Privacy Policy
                        </Link>
                        <span className="text-rose-500">*</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <FaPaperPlane className="text-xs" />
                          <span>Send Message</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
