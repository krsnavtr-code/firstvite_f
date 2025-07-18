import React from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { getCardBgColor } from "../../utils/gradients";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Krishna Avtar",
      role: "Book Enthusiast",
      content:
        "This platform has completely transformed my reading habits. The book recommendations are spot on, and the reading experience is seamless.",
      avatar: "../../images/team-1.jpg",
      rating: 5,
    },
    {
      id: 2,
      name: "Preeti Sharma",
      role: "Student",
      content:
        "As a student, I appreciate the wide range of academic books available. The search functionality makes it easy to find exactly what I need.",
      avatar: "../../images/team-2.jpg",
      rating: 4,
    },
    {
      id: 3,
      name: "Rahul Gahlot",
      role: "Librarian",
      content:
        "I recommend this platform to all our library members. The collection is vast and the interface is user-friendly.",
      avatar: "../../images/team-3.jpg",
      rating: 5,  
    },
    {
      id: 4,
      name: "Ravi Teja",
      role: "Author",
      content:
        "This platform has completely transformed my reading habits. The book recommendations are spot on, and the reading experience is seamless.",
      avatar: "../../images/team-4.jpg",
      rating: 5,
    },
    {
      id: 5,
      name: "Rakesh Rathore",
      role: "Book Enthusiast",
      content:
        "This platform has completely transformed my reading habits. The book recommendations are spot on, and the reading experience is seamless.",
      avatar: "../../images/team-5.jpg",
      rating: 5,
    },
    {
      id: 6,
      name: "Ravi Kumar",
      role: "Student",
      content:
        "As a student, I appreciate the wide range of academic books available. The search functionality makes it easy to find exactly what I need.",
      avatar: "../../images/team-6.jpg",
      rating: 4,
    },
  ];

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ));
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl">
            What Our Readers Say
          </h2>
          <p className="mt-4 text-xl text-black dark:text-white">
            Join thousands of satisfied readers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`${getCardBgColor(testimonial)} p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.avatar}
                    alt={`${testimonial.name}'s avatar`}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-black dark:text-white">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
              <div className="relative">
                <FaQuoteLeft className="text-gray-200 dark:text-white text-4xl absolute -top-2 -left-2" />
                <p className="relative z-10 text-black dark:text-white italic">
                  {testimonial.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
