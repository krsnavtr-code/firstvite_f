import React from 'react';
import { FaBook, FaUsers, FaBookOpen, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getCardBgColor } from '../../utils/gradients';

const stats = [
  { id: 1, name: 'Books Available', value: '10,000+', icon: FaBook },
  { id: 2, name: 'Happy Readers', value: '50,000+', icon: FaUsers },
  { id: 3, name: 'Books Read', value: '1M+', icon: FaBookOpen },
  { id: 4, name: '5 Star Ratings', value: '50,000+', icon: FaStar },
];

const Stats = () => {
  return (
    <section className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${getCardBgColor(stat, stat.id)}`}
              whileHover={{ 
                y: -5,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/80 dark:bg-black/50 text-blue-600 dark:text-blue-300 backdrop-blur-sm">
                  <stat.icon className="h-8 w-8" aria-hidden="true" />
                </div>
              </div>
              <h3 className="mt-6 text-3xl font-bold text-black dark:text-white">
                {stat.value}
              </h3>
              <p className="mt-2 text-black dark:text-white">
                {stat.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
