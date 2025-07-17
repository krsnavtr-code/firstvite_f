import { useState, useEffect } from 'react';
import React from 'react';
import ContactFormModal from '../components/common/ContactFormModal.jsx';

const CONTACT_FORM_SHOWN_KEY = 'contactFormShown';

const useContactFormPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Show the popup on every page load after a delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      setIsInitialized(true);
    }, 3000); // Show after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

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
    closeContactForm: closeModal
  };
};

export default useContactFormPopup;
