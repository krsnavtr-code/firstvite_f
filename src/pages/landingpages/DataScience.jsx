import React, { useState } from "react";
// Agar SEO component apke paas hai toh uncomment karein, warna next.js/react-helmet use karein
// import SEO from "../../components/SEO";
import { submitContactForm } from "../../api/contactApi";
import { toast } from "react-toastify";
import {
  FaGraduationCap,
  FaChartLine,
  FaBrain,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaCertificate,
  FaLaptopCode,
  FaArrowRight,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaClock,
  FaFileAlt,
  FaQuestionCircle,
  FaTags,
} from "react-icons/fa";

export default function MetaAdsLanding() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for API
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Data Science Landing Page Form Submission\n\nExperience Level: ${formData.experience}\n\nUser is interested in the Data Science, Data Analysis & AI Masterclass course.`,
        subject: "Data Science Course Inquiry - Landing Page",
        courseTitle: "Data Science, Data Analysis & AI Masterclass",
      };

      // Submit to API
      const response = await submitContactForm(contactData);

      if (response.success) {
        setFormSubmitted(true);
        toast.success(
          "Registration successful! Our counselor will contact you soon.",
          {
            position: "top-center",
            autoClose: 5000,
          },
        );

        // Reset form after success
        setTimeout(() => {
          setFormSubmitted(false);
          setFormData({ name: "", email: "", phone: "", experience: "" });
        }, 4000);
      } else {
        toast.error(
          response.message || "Failed to submit form. Please try again.",
          {
            position: "top-center",
            autoClose: 5000,
          },
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to submit form. Please try again.", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Smooth Scroll function for CTA buttons
  const scrollToForm = (e) => {
    e.preventDefault();
    document
      .getElementById("enroll-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  const curriculum = [
    {
      icon: FaChartLine,
      title: "Module 1: Data Analysis Pro",
      topics: [
        "Advanced Excel & SQL",
        "Power BI & Tableau",
        "Data Visualization",
        "Business Statistics",
      ],
    },
    {
      icon: FaGraduationCap,
      title: "Module 2: Data Science Foundation",
      topics: [
        "Python Programming",
        "Exploratory Data Analysis",
        "Machine Learning Algorithms",
        "Predictive Modeling",
      ],
    },
    {
      icon: FaBrain,
      title: "Module 3: AI & Deep Learning",
      topics: [
        "Neural Networks",
        "NLP & Computer Vision",
        "TensorFlow & PyTorch",
        "Generative AI Basics",
      ],
    },
  ];

  const targetAudience = [
    {
      title: "IT Professionals",
      desc: "Looking to upgrade skills and get a high-paying salary hike.",
    },
    {
      title: "Non-IT Background",
      desc: "Want to switch to the booming tech industry with zero coding experience.",
    },
    {
      title: "Freshers & Students",
      desc: "Aiming to start their career in Data Science & AI directly.",
    },
  ];

  const faqs = [
    {
      q: "Do I need coding experience?",
      a: "No, we teach everything from scratch. Basic math knowledge is enough.",
    },
    {
      q: "Do you provide job assistance?",
      a: "Yes, we offer 100% placement assistance, resume building, and mock interviews.",
    },
    {
      q: "Is this a live or recorded course?",
      a: "It's a mix of live interactive classes and recorded sessions for lifetime access.",
    },
  ];

  const partners = ["Google", "Microsoft", "Amazon", "IBM", "Meta", "Deloitte"];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 font-sans">
      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">Combo Offer Ends Soon</p>
          <p className="text-lg font-bold text-blue-900">
            ₹46,000{" "}
            <span className="line-through text-sm text-gray-400">₹75,000</span>
          </p>
        </div>
        <button
          onClick={scrollToForm}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-bold animate-pulse"
        >
          Book Free Demo
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden pt-12 pb-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-7 text-white">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400/20 text-yellow-300 rounded-full mb-6 border border-yellow-400/30">
                <FaStar className="mr-2" />
                <span className="text-sm font-semibold">
                  India's #1 Most Comprehensive Course
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Master{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Data Science, Analysis & AI
                </span>{" "}
                in One Program
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl">
                Stop buying separate courses! Get our 3-in-1 Masterclass with
                15+ live projects, guaranteed internships, and 100% placement
                assistance.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-800/50 p-3 rounded-lg border border-blue-700">
                  <FaClock className="text-cyan-400 text-xl mb-2" />
                  <p className="text-sm font-semibold">4 Months</p>
                  <p className="text-xs text-blue-200">Duration</p>
                </div>
                <div className="bg-blue-800/50 p-3 rounded-lg border border-blue-700">
                  <FaLaptopCode className="text-cyan-400 text-xl mb-2" />
                  <p className="text-sm font-semibold">11+ Projects</p>
                  <p className="text-xs text-blue-200">Hands-on</p>
                </div>
                <div className="bg-blue-800/50 p-3 rounded-lg border border-blue-700">
                  <FaCertificate className="text-cyan-400 text-xl mb-2" />
                  <p className="text-sm font-semibold">3 Certs</p>
                  <p className="text-xs text-blue-200">Industry Valid</p>
                </div>
                <div className="bg-blue-800/50 p-3 rounded-lg border border-blue-700">
                  <FaUserTie className="text-cyan-400 text-xl mb-2" />
                  <p className="text-sm font-semibold">Job Support</p>
                  <p className="text-xs text-blue-200">100% Assured</p>
                </div>
              </div>
            </div>

            {/* Hero Form */}
            <div id="enroll-form" className="lg:col-span-5 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-30"></div>
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Book Your Free Demo Class
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Fill the form to unlock a{" "}
                    <span className="text-red-500 font-bold">
                      Flat 60% Discount
                    </span>
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Registration Successful!
                    </h4>
                    <p className="text-gray-600">
                      Our career counselor will call you within 15 minutes.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Number *"
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    />
                    <select
                      required
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-700"
                    >
                      <option value="">Current Experience Level *</option>
                      <option value="student">Student / Fresher</option>
                      <option value="1-3-years">1-3 Years Experience</option>
                      <option value="3-plus-years">3+ Years Experience</option>
                      <option value="non-it">Non-IT Professional</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        "Get Syllabus & Discount Offer"
                      )}
                    </button>
                    <p className="text-xs text-gray-400 text-center flex items-center justify-center mt-2">
                      <FaCheckCircle className="mr-1 text-green-500" /> Your
                      data is 100% secure with us
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-900">10k+</p>
              <p className="text-sm text-gray-500">Learners</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">4.8/5</p>
              <p className="text-sm text-gray-500">Google Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">12 LPA+</p>
              <p className="text-sm text-gray-500">Avg. Package</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">150+</p>
              <p className="text-sm text-gray-500">Hiring Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">
              Course Curriculum
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              3 Powerful Domains, 1 Master Program
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We take you from absolute basics to advanced AI implementations.
              No prior coding experience required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {curriculum.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {module.title}
                  </h3>
                  <ul className="space-y-3 mb-8">
                    {module.topics.map((topic, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center px-8 py-4 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
            >
              <FaFileAlt className="mr-2" /> Download Complete Syllabus
            </button>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Who Is This Masterclass For?
              </h2>
              <div className="space-y-6">
                {targetAudience.map((item, i) => (
                  <div
                    key={i}
                    className="flex p-4 rounded-xl border border-gray-100 shadow-sm bg-gray-50"
                  >
                    <div className="mt-1 bg-blue-100 p-3 rounded-full h-min">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center space-x-2 text-yellow-400 text-xl mb-2">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="font-bold text-gray-900">"Highly Recommended!"</p>
                <p className="text-sm text-gray-500">- 5000+ Alumni</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Special Offer Section */}
      <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-blue-800 opacity-20">
          <FaTags size={300} />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Limited Time Combo Offer!
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Enroll today and get 3 Premium Courses for the price of 1, plus Free
            Bonuses worth ₹10,000.
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto mb-8">
            <p className="text-lg text-blue-200 mb-2">
              Total Value: <span className="line-through">₹75,000</span>
            </p>
            <p className="text-5xl font-extrabold text-yellow-400 mb-6">
              ₹46,000{" "}
              <span className="text-lg text-white font-normal">only</span>
            </p>
            <div className="text-left space-y-3 mb-8 max-w-md mx-auto">
              <p className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-3" /> Lifetime
                Course Access
              </p>
              <p className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-3" /> 1-on-1 Mentor
                Support
              </p>
              <p className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-3" /> Dedicated
                Placement Cell
              </p>
            </div>
            <button
              onClick={scrollToForm}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-lg font-bold rounded-lg hover:from-yellow-300 hover:to-orange-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all"
            >
              Claim This Offer Now
            </button>
            <p className="text-sm text-blue-200 mt-4">
              *EMI options available starting at ₹1,500/month
            </p>
          </div>
        </div>
      </section>

      {/* Alumni / Partners */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-gray-600 mb-8">
            Our Alumni Work At Top Companies
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {partners.map((partner, index) => (
              <span key={index} className="text-2xl font-black text-gray-800">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h4 className="flex items-center text-lg font-bold text-gray-900 mb-2">
                  <FaQuestionCircle className="text-blue-500 mr-3" /> {faq.q}
                </h4>
                <p className="text-gray-600 ml-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Your Journey To A 6-Figure Salary
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join the top 1% of Data & AI professionals. Next batch starts in 3
            days!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToForm}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors flex justify-center items-center shadow-lg"
            >
              Secure Your Seat <FaArrowRight className="ml-2" />
            </button>
            <a
              href="tel:+919891030303"
              className="px-8 py-4 border-2 border-white/30 hover:bg-white/10 text-white font-bold rounded-lg transition-colors flex justify-center items-center"
            >
              <FaPhone className="mr-2" /> Talk To Counselor
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
