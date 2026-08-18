import React from "react";
import { FaQuoteLeft, FaArrowRight, FaStar, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCardBgColor } from "../../utils/gradients";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Rahul Kumar",
      role: "Data Analyst, TCS",
      content:
        "The Data Science course at Eklabya was practical from day one. The trainers didn't just explain concepts, they built real projects with us, which made all the difference when I sat for interviews.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745027-1855.png",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Business Analyst, Infosys",
      content:
        "I came in with zero background in tech and left with a job offer. The structured curriculum and the placement team's support made a career switch that felt impossible to actually happen.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745036-6410.png",
      rating: 5,
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Cloud Engineer, Wipro",
      content:
        "What stood out was how current the course content was. We weren't learning outdated tools, everything mapped to what companies are using right now, which made the transition to a cloud role smooth.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745003-1010.png",
      rating: 5,
    },
    {
      id: 4,
      name: "Sneha Verma",
      role: "Software Developer, HCL",
      content:
        "The live doubt-clearing sessions were a game-changer. I never felt stuck for more than a day, and the mentors genuinely cared whether I understood the material, not just whether I finished the module.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960745009-2116.png",
      rating: 5,
    },
    {
      id: 5,
      name: "Vikram Singh",
      role: "SAP Consultant, Capgemini",
      content:
        "Eklabya's SAP certification gave me the exact skill set my company needed for an internal promotion. The ISO-certified credential also made the process of validating my new role much easier with HR.",
      avatar: "https://www.eklabya.com/api/upload/file/1777960744997-1415.png",
      rating: 5,
    },
  ];

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i}>
          {i < rating ? (
            <FaStar className="w-4 h-4 text-amber-400" />
          ) : (
            <FaRegStar className="w-4 h-4 text-amber-400" />
          )}
        </span>
      ));
  };

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-6xl mx-auto mb-6 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3.5 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            What Our Learners Say
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Real outcomes from real students, not stock reviews.
          </p>
        </div>

        {/* Testimonials Grid (3 columns for desktop, responsive layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {testimonials.map((testimonial) => {
            const cardBg = getCardBgColor(testimonial);
            return (
              <div
                key={testimonial.id}
                className={`${cardBg} group relative p-2 md:p-4 rounded-3xl bg-white dark:bg-gray-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between`}
              >
                <div>
                  {/* Quote Icon Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <FaQuoteLeft className="text-blue-500/20 dark:text-blue-400/20 text-3xl group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Review Content */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-6">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* User Details Footer */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-blue-500/20 shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={testimonial.avatar}
                      alt={`${testimonial.name}'s avatar`}
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
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

        {/* CTA Button */}
        <div className="mt-4 text-center">
          {/* <Link
            to="/placements"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-98"
          >
            <span>Read More Alumni Stories</span>
            <FaArrowRight className="text-xs" />
          </Link> */}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
