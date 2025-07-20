/**
 * Razorpay utility with console warning suppression
 */

// Store original fetch
const originalFetch = window.fetch;

// Override fetch to suppress specific warnings
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  // Clone the response so we can read it multiple times
  const clonedResponse = response.clone();
  
  // Create a new text() method to filter out unwanted warnings
  const originalText = response.text;
  response.text = async () => {
    const text = await originalText.call(response);
    // Filter out the specific warning about x-rtb-fingerprint-id
    if (text && typeof text === 'string' && text.includes('x-rtb-fingerprint-id')) {
      return ''; // Return empty string for these warnings
    }
    return text;
  };
  
  return response;
};

// Function to load Razorpay script
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      // Restore original fetch after Razorpay is loaded
      window.fetch = originalFetch;
      resolve(true);
    };
    
    script.onerror = () => {
      // Restore original fetch on error too
      window.fetch = originalFetch;
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// Function to initialize Razorpay payment
export const initRazorpayPayment = (options) => {
  if (!window.Razorpay) {
    console.error('Razorpay not loaded');
    return null;
  }
  return new window.Razorpay(options);
};
