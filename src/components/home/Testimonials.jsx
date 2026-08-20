import React from "react";
import { FaQuoteLeft, FaStar, FaRegStar } from "react-icons/fa";
import { getCardBgColor } from "../../utils/gradients";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Aman Verma",
      role: "Data Science | Eklabya",
      content:
        "The Data Science course was practical and easy to understand. I especially liked the hands-on projects and real-world examples.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745027-1855.png",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Digital Marketing | Eklabya",
      content:
        "A great course for learning SEO, Google Ads and social media marketing. The practical approach made everything easier to understand.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745036-6410.png",
      rating: 5,
    },
    {
      id: 3,
      name: "Rahul Mehta",
      role: "Full Stack Development | Eklabya",
      content:
        "The development training helped me understand frontend and backend concepts through practical projects. Overall, a very useful learning experience.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745003-1010.png",
      rating: 5,
    },
    {
      id: 4,
      name: "Neha Gupta",
      role: "AI & Machine Learning | Eklabya",
      content:
        "The AI and Machine Learning course explained complex topics in a simple way. The practical sessions were especially helpful.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745009-2116.png",
      rating: 5,
    },
    {
      id: 5,
      name: "Rohit Kumar",
      role: "Python | Eklabya",
      content:
        "I really enjoyed the Python training. The concepts were explained clearly and the practical exercises helped me build confidence.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960744997-1415.png",
      rating: 5,
    },
    {
      id: 6,
      name: "Pooja Verma",
      role: "SAP FICO | Eklabya",
      content:
        "The SAP FICO training gave me a clear understanding of accounting concepts and their practical use in SAP.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745027-1855.png",
      rating: 5,
    },
    {
      id: 7,
      name: "Arjun Singh",
      role: "Web Development | Eklabya",
      content:
        "A good learning experience with practical web development projects. The training helped me improve my technical skills.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745036-6410.png",
      rating: 5,
    },
    {
      id: 8,
      name: "Anjali Sharma",
      role: "Cyber Security | Eklabya",
      content:
        "The Cyber Security course covered important concepts in an easy-to-understand way. I found the practical learning very useful.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745003-1010.png",
      rating: 5,
    },
    {
      id: 9,
      name: "Vikash Gupta",
      role: "Data Analytics | Eklabya",
      content:
        "The Data Analytics training helped me understand data visualization and analysis through practical examples and projects.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745009-2116.png",
      rating: 5,
    },
    {
      id: 10,
      name: "Simran Kaur",
      role: "Digital Marketing & SEO | Eklabya",
      content:
        "The Digital Marketing training gave me practical knowledge of SEO, paid advertising and social media marketing. A useful course for beginners.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960744997-1415.png",
      rating: 5,
    },
    {
      id: 11,
      name: "Nitin Sharma",
      role: "React Development | Eklabya",
      content:
        "The React training was structured well and focused on practical development. I gained much more confidence after working on projects.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745027-1855.png",
      rating: 5,
    },
    {
      id: 12,
      name: "Kavya Singh",
      role: "Overall Experience | Eklabya",
      content:
        "Eklabya offers a practical learning environment with courses covering technology, digital marketing and professional skills. I had a positive learning experience.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745036-6410.png",
      rating: 5,
    },
  ];

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i}>
          {i < rating ? (
            <FaStar className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <FaRegStar className="w-3.5 h-3.5 text-amber-400" />
          )}
        </span>
      ));
  };

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3.5 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            What Our Learners Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Real outcomes from real students, not stock reviews.
          </p>
        </div>
      </div>

      {/* Infinite Scrolling Marquee Wrapper */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Gradient Fades for Smooth Edge Blending */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {/* We duplicate the array to create a seamless infinite loop effect */}
          {[...testimonials, ...testimonials].map((testimonial, idx) => {
            const cardBg = getCardBgColor(testimonial);
            return (
              <div
                key={`${testimonial.id}-${idx}`}
                className={`${cardBg} group relative w-[320px] sm:w-[380px] mx-3 p-6 rounded-3xl bg-white dark:bg-gray-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between shrink-0`}
              >
                <div>
                  {/* Quote Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <FaQuoteLeft className="text-blue-500/20 dark:text-blue-400/20 text-2xl group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-6 line-clamp-4">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* User Details Footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/20 shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={testimonial.avatar}
                      alt={`${testimonial.name}'s avatar`}
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {testimonial.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tailwind Custom Marquee Animation Styling */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
