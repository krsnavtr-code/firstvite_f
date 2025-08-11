import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import React from "react";
import ContactFormModal from "../components/common/ContactFormModal.jsx";

const CONTACT_FORM_SHOWN_KEY = "contactFormShown";

const useContactFormPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if current path should show the contact form
    const shouldShowForm = () => {
      const path = location.pathname;
      // Don't show on admin, LMS, auth, or thank you routes
      if (
        path.startsWith("/admin") ||
        path.startsWith("/lms") ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/register") ||
        path.startsWith("/profile") ||
        path.startsWith("/my-learning") ||
        path.startsWith("/blog") ||
        path.startsWith("/contact") ||
        path.startsWith("/thank-you")
      ) {
        return false;
      }
      return true;
    };

    // Only show the popup on allowed routes
    if (shouldShowForm()) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsInitialized(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const ContactFormPopup = () => (
    <ContactFormModal isOpen={isOpen} onClose={closeModal} />
  );

  return {
    ContactFormPopup,
    isInitialized,
    openContactForm: () => setIsOpen(true),
    closeContactForm: closeModal,
  };
};

export default useContactFormPopup;
