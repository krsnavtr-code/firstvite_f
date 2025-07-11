import React from 'react';
import { FaStar, FaRegStar, FaHeart, FaBookOpen } from 'react-icons/fa';
import { getCardGradient } from '../../utils/gradients';

const FeaturedBooks = () => {
  const books = [
    {
      id: 1,
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      price: '₹499',
      rating: 4.7,
      image: 'https://m.media-amazon.com/images/I/71g2ednj0JL._AC_UF1000,1000_QL80_.jpg',
      category: 'Finance'
    },
    {
      id: 2,
      title: 'Atomic Habits',
      author: 'James Clear',
      price: '₹399',
      rating: 4.8,
      image: 'https://m.media-amazon.com/images/I/91bYsX41DVL._AC_UF1000,1000_QL80_.jpg',
      category: 'Self-Help'
    },
    {
      id: 3,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      price: '₹299',
      rating: 4.6,
      image: 'https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg',
      category: 'Fiction'
    },
    {
      id: 4,
      title: 'Deep Work',
      author: 'Cal Newport',
      price: '₹449',
      rating: 4.5,
      image: 'https://m.media-amazon.com/images/I/71t4GuxLCuL._AC_UF1000,1000_QL80_.jpg',
      category: 'Productivity'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Featured Books
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Discover our most popular titles
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <div key={book.id} className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${getCardGradient(book, book.id)}`}>
              <div className="relative">
                <img 
                  src={book.image} 
                  alt={book.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white/80 dark:bg-black/80 text-gray-800 dark:text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                  {book.category}
                </div>
                <button className="absolute top-2 left-2 p-2 bg-white/80 dark:bg-black/80 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-300 backdrop-blur-sm">
                  <FaHeart />
                </button>
              </div>
              <div className="p-6 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{book.author}</p>
                <div className="flex items-center mb-3">
                  <div className="flex mr-2">
                    {renderStars(book.rating)}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {book.rating}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {book.price}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-300 flex items-center">
                    <FaBookOpen className="mr-2" />
                    Read Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors duration-300">
            View All Books
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
