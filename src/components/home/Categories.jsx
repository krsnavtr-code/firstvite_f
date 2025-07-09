import React from 'react';
import { FaBook, FaLaptopCode, FaChartLine, FaPalette, FaLanguage, FaMusic } from 'react-icons/fa';

const Categories = () => {
  const categories = [
    { icon: <FaBook className="text-3xl text-blue-500" />, name: 'Literature', count: '120+ Books' },
    { icon: <FaLaptopCode className="text-3xl text-green-500" />, name: 'Technology', count: '85+ Books' },
    { icon: <FaChartLine className="text-3xl text-purple-500" />, name: 'Business', count: '64+ Books' },
    { icon: <FaPalette className="text-3xl text-yellow-500" />, name: 'Art & Design', count: '42+ Books' },
    { icon: <FaLanguage className="text-3xl text-red-500" />, name: 'Languages', count: '36+ Books' },
    { icon: <FaMusic className="text-3xl text-pink-500" />, name: 'Music', count: '28+ Books' },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Explore Categories
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Discover books in your favorite categories
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{category.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;
