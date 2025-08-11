import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { getFAQs } from '../api/faqApi';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        console.log('Fetching FAQs...');
        const data = await getFAQs();
        console.log('Received FAQs data:', data);
        
        if (!Array.isArray(data)) {
          console.error('Expected an array of FAQs but got:', data);
          setError('Invalid data format received from server');
          setFaqs([]);
          return;
        }
        
        setFaqs(data);
        console.log(`Loaded ${data.length} FAQs`);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Frequently Asked Questions | FirstVITE"
        description="Find answers to common questions about our courses, payments, enrollment process, and more. Get help with your learning journey at FirstVITE."
        keywords="FAQ, frequently asked questions, course help, payment questions, enrollment help, FirstVITE support, learning platform"
        og={{
          title: 'Frequently Asked Questions | FirstVITE',
          description: 'Get answers to common questions about our courses, payments, and learning platform. Everything you need to know about FirstVITE in one place.',
          type: 'website'
        }}
      />
      <div className="py-16 px-4 sm:px-6 lg:px-8">

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions about our courses, payments, and more.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <div 
                key={faq._id || faq.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  className={`w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none ${
                    activeIndex === index 
                      ? 'bg-blue-50 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {activeIndex === index ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </button>
                {activeIndex === index && (
                  <div className="px-6 pb-4 pt-2 text-gray-600 dark:text-gray-300">
                    <div 
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No FAQs found. Please check back later.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Contact Support
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};

export default FAQPage;
