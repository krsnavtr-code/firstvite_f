import React from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUsers, FaLaptopCode, FaHeadset, FaChartLine, FaCertificate } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CorporateTraining = () => {
  const trainingPrograms = [
    {
      icon: <FaChalkboardTeacher className="text-4xl text-blue-600 mb-4" />,
      title: 'Customized Training',
      description: 'Tailored programs designed specifically for your organization\'s needs and goals.'
    },
    {
      icon: <FaUsers className="text-4xl text-green-600 mb-4" />,
      title: 'Team Training',
      description: 'Enhance your team\'s skills with our collaborative learning programs.'
    },
    {
      icon: <FaLaptopCode className="text-4xl text-purple-600 mb-4" />,
      title: 'Technical Skills',
      description: 'Cutting-edge technical training in the latest technologies and frameworks.'
    },
    {
      icon: <FaHeadset className="text-4xl text-yellow-600 mb-4" />,
      title: 'Soft Skills',
      description: 'Develop essential workplace skills like communication, leadership, and teamwork.'
    },
    {
      icon: <FaChartLine className="text-4xl text-red-600 mb-4" />,
      title: 'Leadership Development',
      description: 'Programs designed to cultivate the next generation of business leaders.'
    },
    {
      icon: <FaCertificate className="text-4xl text-indigo-600 mb-4" />,
      title: 'Certification Programs',
      description: 'Industry-recognized certifications to validate your team\'s expertise.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Corporate Training Solutions</h1>
            <p className="text-xl mb-8 opacity-90">
              Empower your workforce with our comprehensive corporate training programs designed to drive business growth and employee development.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="bg-white text-blue-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 inline-block"
              >
                Request a Demo
              </Link>
              <Link
                to="/courses"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-700 font-semibold py-3 px-8 rounded-lg transition duration-300 inline-block"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Our Corporate Training?</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              We deliver high-impact training solutions that align with your business objectives and drive measurable results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainingPrograms.map((program, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-center">
                  {program.icon}
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{program.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{program.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Transform Your Workforce?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Contact us today to discuss your corporate training needs and how we can help your team succeed.
            </p>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateTraining;
