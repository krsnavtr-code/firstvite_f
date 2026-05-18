import React, { useState } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

// Comprehensive mock data for the main page so everything is fully readable upfront
const ALL_TESTIMONIALS = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Full Stack Developer",
    company: "TechMahindra",
    category: "Career Transition",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    content:
      "I had done two other basic coding courses before, but all they gave me was a generic certificate and zero confidence. This certification program was completely different. The MERN stack capstone projects weren't just copied from YouTube tutorials; we built unique, complex apps. Adding this verified credential to my resume and LinkedIn completely changed how recruiters responded to my off-campus applications.",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Data Analyst",
    company: "Deloitte",
    category: "Upskilling",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    content:
      "Most online certificates are just a checkbox, but the curriculum here gave me actual talking points for my interviews. The Power BI and Advanced SQL modules focused strictly on corporate case studies. When the Deloitte hiring manager looked at my course certification project, they spent 15 minutes asking how I handled the messy data pipeline. That’s when I knew this course was worth every rupee.",
    rating: 5,
  },
  {
    id: 3,
    name: "Rohan Das",
    role: "Software Engineer",
    company: "Swiggy",
    category: "Students",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    content:
      "Our tier-3 college didn't have big product companies coming for placements. I needed a professional certification that could clear industry ATS filters. This course didn't just give me a PDF certificate; the community support, resume-building sessions, and mock interview prep helped me bridge the gap. I used my course projects to showcase my Git and Docker skills, which helped me land my Swiggy offer.",
    rating: 5,
  },
  {
    id: 4,
    name: "Ananya Iyer",
    role: "UI/UX Designer",
    company: "Freelance",
    category: "Upskilling",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    content:
      "As a self-taught designer, I lacked a structured portfolio to convince premium clients. This UI/UX certification forced me to stop just copying UI trends and actually build a comprehensive case study from scratch. Having a structured, industry-recognized certificate gave me the professional credibility I needed to pitch to international startups and scale my freelance rates.",
    rating: 5,
  },
  {
    id: 5,
    name: "Vikram Malhotra",
    role: "DevOps Engineer",
    company: "Capgemini",
    category: "Career Transition",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    content:
      "I was skeptical about online certification courses because I already had a full-time tech support job and very little time. But the self-paced structure combined with weekend doubt-clearing sessions made it manageable. The AWS labs were flawless, and the platform's course completion certificate actually helped me transition internal teams at my company into a core DevOps role.",
    rating: 5,
  },
  {
    id: 6,
    name: "Sneha Reddy",
    role: "Associate Product Manager",
    company: "Jio",
    category: "Upskilling",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    content:
      "Transitioning into Product Management without a core tech background is incredibly tough in India. This specific e-learning certificate program came highly recommended by peers on LinkedIn. The technical essentials module translated complex system design and API concepts into business logic. Getting this certificate marked a massive turning point in clearing the product rounds at Jio.",
    rating: 5,
  },
];

const CATEGORIES = ["All", "Career Transition", "Upskilling", "Students"];

export default function TestimonialsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTestimonials =
    activeCategory === "All"
      ? ALL_TESTIMONIALS
      : ALL_TESTIMONIALS.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <SEO
        title="Testimonials | Eklabya - What Our Learners Say"
        description="Read authentic, full-length testimonials from our satisfied learners. Discover how Eklabya has helped students and professionals achieve their learning goals without limitations."
        keywords="testimonials, reviews, learner feedback, Eklabya reviews, student testimonials, course reviews, online learning experience"
        og={{
          title: "Testimonials - What Our Learners Say About Eklabya",
          description:
            "Hear from our community of learners who have transformed their careers with Eklabya's courses and programs.",
          type: "website",
        }}
      />

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-blue-500/30 text-blue-100 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Success Stories
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            What Our Learners Say
          </h1>
          <p className="text-lg md:text-xl max-w-4xl mx-auto text-blue-100 font-light leading-relaxed">
            Real stories from real people who have upskilled, switched
            industries, and transformed their professional trajectories with
            Eklabya.
          </p>
        </div>
      </section>

      {/* Category Filter Controls */}
      <section className="pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Main Full-Text Testimonials Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div>
                {/* Five Star Rating Row */}
                <div className="flex text-amber-400 mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Full Review Content without Truncation */}
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6 font-normal italic">
                  "{item.content}"
                </p>
              </div>

              {/* User Bio Details */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.role} &middot;{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {item.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Dashboard Strip */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-850 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "1,000+", label: "Active Learners" },
              { number: "200+", label: "Courses Available" },
              { number: "95%", label: "Satisfaction Rate" },
              { number: "28+", label: "Expert Instructors" },
            ].map((stat, index) => (
              <div key={index} className="p-2">
                <div className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-500 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Conversion Block */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied learners and take the definitive step
            toward achieving your strategic career goals today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/courses"
              className="w-full sm:w-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-xl transition duration-300 shadow-md shadow-blue-500/10 text-center"
            >
              Browse Courses
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-block border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3.5 px-8 rounded-xl transition duration-300 text-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
