import React from "react";
import {
  GraduationCap,
  Building2,
  Award,
  TrendingUp,
  Briefcase,
  ExternalLink,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";

const StudentPlacements = () => {
  const placementStats = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      number: "485+",
      label: "Students Placed",
      color: "bg-blue-500",
      shadow: "shadow-blue-200",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      number: "200+",
      label: "Hiring Partners",
      color: "bg-emerald-500",
      shadow: "shadow-emerald-200",
    },
    {
      icon: <Award className="w-6 h-6" />,
      number: "5.5 LPA",
      label: "Average Package",
      color: "bg-purple-500",
      shadow: "shadow-purple-200",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      number: "95%",
      label: "Placement Rate",
      color: "bg-orange-500",
      shadow: "shadow-orange-200",
    },
  ];

  const topCompanies = [
    { name: "TCS", color: "text-blue-600" },
    { name: "Infosys", color: "text-red-600" },
    { name: "Wipro", color: "text-pink-600" },
    { name: "HCL", color: "text-red-700" },
    { name: "Capgemini", color: "text-blue-700" },
    { name: "IBM", color: "text-blue-800" },
    { name: "Microsoft", color: "text-orange-600" },
    { name: "Amazon", color: "text-orange-500" },
  ];

  const studentStories = [
    {
      name: "Rahul Kumar",
      course: "Full Stack Development",
      company: "TCS",
      package: "12 LPA",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      quote:
        "The Data Science course at Eklabya was very practical and easy to understand. Trainers explained concepts with real projects.",
    },
    {
      name: "Priya Sharma",
      course: "Data Science",
      company: "Infosys",
      package: "15 LPA",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      quote:
        "From a beginner to a data scientist, this journey has been amazing. The placement team was with me.",
    },
    {
      name: "Amit Patel",
      course: "Cloud Computing",
      company: "Wipro",
      package: "10 LPA",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994d43e?w=100&h=100&fit=crop&crop=face",
      quote:
        "Practical projects and industry connections made the difference. I'm now working on cloud technologies.",
    },
  ];

  return (
    <section className="relative py-16 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6"
          >
            <Briefcase className="w-4 h-4" /> Successful Careers
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Our Placements Speak{" "}
            <span className="text-blue-600 italic">Louder.</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            We don't just teach code; we build professional futures. Join 480+
            alumni working in the world's most innovative tech companies.
          </p>
        </div>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {placementStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 ${stat.color} ${stat.shadow} shadow-lg rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {stat.number}
              </div>
              <div className="text-slate-500 font-medium uppercase tracking-wider text-xs">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div> */}

        {/* Company Logo Strip */}
        <div className="mb-24 px-8 py-8 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white dark:from-gray-800 to-transparent z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white dark:from-gray-800 to-transparent z-10" />

          <h3 className="text-center font-medium text-sm uppercase tracking-widest mb-10">
            Trusted by Global Tech Leaders
          </h3>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {topCompanies.map((company) => (
              <span
                key={company.name}
                className={`text-xl font-bold grayscale transition-all cursor-default hover:grayscale-0 ${company.color} dark:text-gray-600 dark:hover:${company.color}`}
              >
                {company.name}
              </span>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              Alumni Stories
            </h3>
            <button className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all stories <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {studentStories.map((story, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col"
              >
                <Quote className="w-8 h-8 text-blue-100 dark:text-blue-900/30 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed mb-8 flex-grow">
                  "{story.quote}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-50 dark:border-gray-700">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {story.name}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                      {story.company} • {story.package}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative bg-gray-900 dark:bg-gray-800 rounded-[3rem] p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Accent lighting for CTA */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white dark:text-gray-100 mb-6">
              Your dream career is just <br />
              one step away.
            </h3>
            <p className="text-gray-400 dark:text-gray-300 text-lg mb-10 max-w-xl mx-auto">
              Join our next cohort and get personalized career coaching,
              portfolio reviews, and direct referrals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-600/20">
                Apply for Admission
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 dark:border-gray-600/30 px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
                Talk to an Expert
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StudentPlacements;
