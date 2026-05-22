import React, { useState } from "react";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

// Comprehensive mock data for the main page so everything is fully readable upfront
const ALL_TESTIMONIALS = [
  {
    id: 1,
    name: "Krishna Avtar",
    role: "MLOps Engineer",
    email: "krishnaavtar955@gmail.com",
    category: "Get Jobs",
    image:
      "http://www.eklabya.com/api/upload/file/Krishna-4629.png",
    content:
      "I recently completed AI & ML course and I must admit that they have done an awesome job at creating premium and meaningful content. Amazing courses and superb faculty of Harappa. I look forward to keep learning on Harappa and also recommend it.",
    rating: 5,
  },
  {
    id: 2,
    name: "Manika Gahloat",
    role: "Robotics Engineer",
    email: "manikagahloat91@gmail.com",
    category: "Upskilling",
    image:
      "http://www.eklabya.com/api/upload/file/wo-4953.png",
    content:
      "The teaching style of faculty is unique and the courses are not at all boring.  I would highly recommend you to learn and develop yourself by the courses on Harappa Platform. ",
    rating: 5,
  },
  {
    id: 3,
    name: "Ankit Kumar",
    role: "Generative AI Engineer",
    email: "ankitdhanka037@gmail.com",
    category: "Students",
    image:
      "http://www.eklabya.com/api/upload/file/Adarsh-3832.png",
    content:
      "Its a great education platform, The faculty is experienced and the content was also very premium. I am satisfied with the overall experience.",
    rating: 5,
  },
  {
    id: 4,
    name: "Vinay Kumar",
    role: "Computer Vision Engineer",
    email: "yadavvinay999790@gmail.com",
    category: "Upskilling",
    image:
      "http://www.eklabya.com/api/upload/file/dar-0262.png",
    content:
      "After my Course Complete I had bad experience with their interview process. Making Decision course has been proved to be really benificial for me. I am very thankful to Harappa Education for providing such content.",
    rating: 5,
  },
  {
    id: 5,
    name: "Devendra Trivedi",
    role: "Machine Learning Engineer",
    email: "devendratrivedi871@gmail.com",
    category: "Get Jobs",
    image:
      "http://www.eklabya.com/api/upload/file/df-3710.png",
    content:
      "This platform is giving great opportunities to one who wants to upskill and learn new things. I can now identify my strenght and weakness and it also helped me in overcoming my weaknesses. Its a great platform!",
    rating: 5,
  },
  {
    id: 6,
    name: "Adarsh Srivastava",
    role: "AI Engineer",
    email: "sriadarsh04@gmail.com",
    category: "Upskilling",
    image:
      "http://www.eklabya.com/api/upload/file/1777960745027-1855.png",
    content:
      "The courses are available in Hindi language also which is very rare on other platforms. Its easy to understand, I am totally satisfied with the whole experience and definitely recommend it to everyone.",
    rating: 5,
  },
];

const CATEGORIES = ["All", "Get Jobs", "Upskilling", "Students"];

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
      <section className="relative py-6 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-blue-500/30 text-blue-100 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Success Stories
          </span>
          <h1 className="text-lg md:text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            What Our Learners Say
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto text-blue-100 font-light leading-relaxed">
            Real stories from real people who have upskilled, switched
            industries, and transformed their professional trajectories with
            Eklabya.
          </p>
        </div>
      </section>

      {/* Category Filter Controls */}
      {/* <section className="pt-8 pb-2 px-2 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-2 py-0.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section> */}

      {/* Main Full-Text Testimonials Grid */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-3 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div>
                {/* Five Star Rating Row */}
                <div className="flex text-amber-400 mb-3">
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
                <p className="text-black dark:text-white text-base leading-relaxed mb-3 font-normal italic">
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
                  </p>
                  <p className="text-xs md:text-lg text-blue-600 dark:text-blue-400 font-medium">
                    {item.email}
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
