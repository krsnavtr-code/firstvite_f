import React, { useState } from "react";
import { submitContactForm } from "../../api/contactApi";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaCertificate,
  FaLaptopCode,
  FaArrowRight,
  FaPhone,
  FaClock,
  FaFileAlt,
  FaQuestionCircle,
  FaBriefcase,
  FaChartLine,
  FaBrain,
  FaRobot,
  FaDatabase,
  FaCode,
  FaTools,
  FaAward,
  FaGraduationCap,
  FaHandshake,
  FaDownload,
  FaBookOpen,
} from "react-icons/fa";

export default function DataScienceLanding() {
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
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Data Science Analytics and AI Programme Landing Page Form Submission\n\nExperience Level: ${formData.experience}\n\nUser is interested in the Data Science Analytics and AI Programme.`,
        subject:
          "Data Science Analytics and AI Programme Inquiry - Landing Page",
        courseTitle: "Data Science Analytics and AI Programme",
      };

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

  const scrollToForm = (e) => {
    e.preventDefault();
    document
      .getElementById("enroll-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  const programmeHighlights = [
    { icon: FaLaptopCode, text: "Live Instructor-Led Training" },
    { icon: FaBriefcase, text: "30+ Real-World Projects" },
    { icon: FaCertificate, text: "Industry-Recognized Certification" },
    { icon: FaRobot, text: "AI & Generative AI Modules" },
    { icon: FaHandshake, text: "Career Support & Interview Preparation" },
    { icon: FaGraduationCap, text: "Beginner-Friendly Learning Path" },
  ];

  const impactStats = [
    { value: "510+", label: "Learners Trained" },
    { value: "30+", label: "Industry Projects" },
    { value: "200+", label: "Hiring Opportunities" },
    { value: "4.8+", label: "Learner Rating" },
    { value: "100%", label: "Practical Learning Approach" },
  ];

  const whyChooseFeatures = [
    {
      icon: FaBookOpen,
      title: "Industry-Relevant Curriculum",
      desc: "Designed by industry experts",
    },
    {
      icon: FaBriefcase,
      title: "Project-Based Learning",
      desc: "Hands-on experience",
    },
    {
      icon: FaUsers,
      title: "Expert Mentorship",
      desc: "Learn from professionals",
    },
    {
      icon: FaChartLine,
      title: "Career-Focused Training",
      desc: "Job-ready skills",
    },
    {
      icon: FaBrain,
      title: "AI-Driven Skill Development",
      desc: "Future-proof learning",
    },
    {
      icon: FaTools,
      title: "Hands-On Practice with Industry Tools",
      desc: "Real-world tools",
    },
  ];

  const careerPaths = [
    {
      title: "Data Analyst",
      desc: "Transform raw data into actionable business insights and support strategic decision-making.",
    },
    {
      title: "Business Analyst",
      desc: "Bridge business objectives and data-driven solutions through analysis and reporting.",
    },
    {
      title: "Data Scientist",
      desc: "Develop predictive models and uncover opportunities using advanced analytical techniques.",
    },
    {
      title: "Machine Learning Engineer",
      desc: "Design intelligent systems capable of learning and improving from data.",
    },
    {
      title: "AI Specialist",
      desc: "Implement Artificial Intelligence solutions to automate and optimize business processes.",
    },
    {
      title: "Business Intelligence Analyst",
      desc: "Create dashboards and reports that help organizations monitor performance effectively.",
    },
  ];

  const curriculum = [
    {
      title: "Data Analytics Fundamentals",
      desc: "Learn data analysis techniques, business reporting, data cleaning, and practical problem-solving using real datasets.",
      icon: FaChartLine,
    },
    {
      title: "SQL & Database Management",
      desc: "Master SQL queries, database concepts, data extraction, filtering, joins, and business data management.",
      icon: FaDatabase,
    },
    {
      title: "Data Visualization with Power BI",
      desc: "Create interactive dashboards, visualize business metrics, and communicate insights through powerful reports.",
      icon: FaChartLine,
    },
    {
      title: "Python for Data Science",
      desc: "Use Python for data manipulation, automation, analysis, and practical data science applications.",
      icon: FaCode,
    },
    {
      title: "Statistics & Business Analytics",
      desc: "Understand statistical methods, probability concepts, and data-driven decision-making techniques.",
      icon: FaChartLine,
    },
    {
      title: "Machine Learning",
      desc: "Build predictive models using classification, regression, clustering, and model evaluation techniques.",
      icon: FaBrain,
    },
    {
      title: "Artificial Intelligence",
      desc: "Explore AI concepts, intelligent systems, automation, and real-world business applications.",
      icon: FaRobot,
    },
    {
      title: "Generative AI & Prompt Engineering",
      desc: "Learn prompt engineering, AI tools, large language models, and AI-powered workflows.",
      icon: FaRobot,
    },
  ];

  const tools = [
    "Python",
    "SQL",
    "Power BI",
    "Excel",
    "Pandas",
    "NumPy",
    "Scikit-Learn",
    "Machine Learning",
    "Generative AI Tools",
    "Artificial Intelligence Platforms",
  ];

  const projects = [
    "Customer Churn Prediction",
    "Sales Forecasting Dashboard",
    "Business Intelligence Reporting",
    "AI-Powered Chatbot",
    "Recommendation System",
    "Customer Segmentation Analysis",
    "Market Trend Analysis",
    "Predictive Analytics Project",
  ];

  const careerServices = [
    "Resume Building",
    "LinkedIn Profile Optimization",
    "Mock Interviews",
    "Portfolio Development",
    "Career Mentorship",
    "Interview Preparation",
    "Placement Assistance",
  ];

  const certificationBenefits = [
    "Showcase Your Skills",
    "Strengthen Your Resume",
    "Enhance Career Opportunities",
    "Validate Industry Knowledge",
  ];

  const faqs = [
    {
      q: "Do I need coding experience to join this programme?",
      a: "No. The programme is designed for beginners and gradually progresses to advanced concepts.",
    },
    {
      q: "Who can enroll in this programme?",
      a: "Students, graduates, working professionals, career switchers, and entrepreneurs can enroll.",
    },
    {
      q: "What tools will I learn during the programme?",
      a: "You will learn Python, SQL, Power BI, Machine Learning, Data Analytics, and Generative AI tools.",
    },
    {
      q: "Will I work on real projects?",
      a: "Yes. The programme includes multiple industry projects and hands-on assignments.",
    },
    {
      q: "Is career support included?",
      a: "Yes. Learners receive resume support, interview preparation, mentorship, and career guidance.",
    },
    {
      q: "Will I receive a certification?",
      a: "Yes. An industry-recognized certification is awarded after successful programme completion.",
    },
    {
      q: "What job roles can I apply for after completion?",
      a: "You can pursue roles such as Data Analyst, Business Analyst, Data Scientist, AI Specialist, and Machine Learning Engineer.",
    },
    {
      q: "How are the classes conducted?",
      a: "Classes are delivered through instructor-led sessions combined with practical assignments and project work.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden pt-16 pb-24">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Data Science Analytics and AI Programme
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-cyan-300 mb-4">
              Become a Job-Ready Data & AI Professional
            </p>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              Master Data Science, Data Analytics, Machine Learning, Artificial
              Intelligence, and Generative AI through hands-on projects,
              industry-focused training, and career support.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {programmeHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-blue-800/50 p-4 rounded-lg border border-blue-700 text-center"
                >
                  <Icon className="text-cyan-400 text-2xl mb-2 mx-auto" />
                  <p className="text-sm font-semibold text-white">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToForm}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Apply Now
            </button>
            <button className="px-8 py-4 border-2 border-white/30 hover:bg-white/10 text-white text-lg font-bold rounded-lg transition-all flex items-center justify-center">
              <FaDownload className="mr-2" /> Download Brochure
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Trusted by Future Data & AI Professionals
            </h2>
          </div>
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-blue-900 mb-2">
              Our Impact
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose the Data Science Analytics and AI Programme?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Today's organizations need professionals who can analyze data,
              build predictive models, and leverage AI for business growth. This
              programme combines Data Analytics, Data Science, Machine Learning,
              and Artificial Intelligence into one career-focused learning
              journey.
            </p>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              What Makes This Programme Different?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center bg-blue-50 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Transform Your Career in Data Science & AI?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join the Data Science Analytics and AI Programme and develop the
              skills employers are actively hiring for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToForm}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-lg transition-all shadow-lg"
              >
                Apply Now
              </button>
              <button className="px-8 py-4 border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white text-lg font-bold rounded-lg transition-all">
                Book Free Counselling
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Career Opportunities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Career Opportunities After Completion
            </h2>
            <p className="text-lg text-gray-600">
              Build skills for high-demand roles across industries.
            </p>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Career Paths
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.map((path, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FaBriefcase className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {path.title}
                </h4>
                <p className="text-gray-600 text-sm">{path.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Course Curriculum
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {curriculum.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {module.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{module.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center bg-gradient-to-r from-blue-900 to-indigo-900 p-8 rounded-2xl text-white">
            <h3 className="text-2xl font-bold mb-4">
              Join Our Success Community with 100% Placement Assistance
            </h3>
            <p className="text-lg mb-6">
              Be part of most successful data science/data analytics marketing
              community
            </p>
            <button
              onClick={scrollToForm}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-lg transition-all shadow-lg"
            >
              Apply Now
            </button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tools & Technologies You'll Master
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {tools.map((tool, index) => (
              <span
                key={index}
                className="px-6 py-3 bg-white rounded-full border border-gray-200 text-gray-700 font-semibold hover:shadow-md transition-shadow"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Work on Industry Projects
            </h2>
            <p className="text-lg text-gray-600">
              Gain practical experience through real-world projects designed to
              strengthen your portfolio.
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Project Portfolio
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center"
              >
                <p className="font-semibold text-gray-900">{project}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Support Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Career Support & Placement Assistance
            </h2>
            <p className="text-lg text-gray-600">
              We help learners become job-ready through structured career
              guidance.
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Career Services
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 gap-4">
            {careerServices.map((service, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">{service}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={scrollToForm}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-lg transition-all shadow-lg"
            >
              Schedule Career Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Earn Your Certification
            </h2>
            <p className="text-lg text-gray-600">
              Receive an industry-recognized Data Science Analytics and AI
              Programme Certification upon successful completion.
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Certification Benefits
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificationBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaAward className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Success Stories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Hear from learners who successfully transitioned into Data
              Analytics, Data Science, and AI careers.
            </p>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Success Highlights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Career Transitions",
              "Salary Growth",
              "Job Placements",
              "Professional Advancement",
            ].map((highlight, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStar className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">{highlight}</p>
              </div>
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

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h4 className="flex items-center text-lg font-bold text-gray-900 mb-2">
                  <FaQuestionCircle className="text-blue-600 mr-3" /> {faq.q}
                </h4>
                <p className="text-gray-600 ml-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Career in Data Science & AI?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join the Data Science Analytics and AI Programme and develop the
            skills employers are actively hiring for.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToForm}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold rounded-lg transition-all shadow-lg"
            >
              Apply Now
            </button>
            <button className="px-8 py-4 border-2 border-white/30 hover:bg-white/10 text-white text-lg font-bold rounded-lg transition-all">
              Book Free Counselling
            </button>
          </div>
        </div>
      </section>

      {/* Enrollment Form Section */}
      <section id="enroll-form" className="py-20 bg-gray-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Apply Now</h3>
              <p className="text-gray-500 text-sm mt-1">
                Fill the form to get started
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
                  Our career counselor will call you soon.
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
                  placeholder="Phone Number *"
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
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
