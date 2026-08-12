import React from "react";
import {
  FaBook,
  FaUsers,
  FaGraduationCap,
  FaBriefcase,
  FaBuilding,
  FaArrowRight,
  FaCommentAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  {
    id: 1,
    name: "Professional Courses",
    value: "180+",
    icon: FaBook,
    color: "from-pink-400 to-rose-500",
  },
  {
    id: 2,
    name: "Expert Tutors",
    value: "55+",
    icon: FaUsers,
    color: "from-purple-400 to-indigo-500",
  },
  {
    id: 3,
    name: "Happy Learners",
    value: "490+",
    icon: FaGraduationCap,
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 4,
    name: "Job Placement Support Rate",
    value: "98%",
    icon: FaBriefcase,
    color: "from-amber-400 to-orange-500",
  },
];

const techCompanies = [
  "TCS",
  "Infosys",
  "Wipro",
  "HCL",
  "Capgemini",
  "IBM",
  "Microsoft",
  "Amazon",
];

const Stats = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-900 py-6 md:py-10 transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- PART 1: Our Impact Numbers --- */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-3.5 py-1 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
            Our Impact
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Numbers That Actually Mean Something
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="relative group p-2 md:p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-slate-200/80 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300"
            >
              <div
                className={`mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}
              >
                <stat.icon className="h-7 w-7" aria-hidden="true" />
              </div>

              <div className="mt-2 text-center">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </h3>
                <p className="mt-1.5 text-xs font-extrabold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.name}
                </p>
              </div>

              <div
                className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${stat.color} transition-all duration-500 group-hover:w-full rounded-b-3xl`}
              />
            </motion.div>
          ))}
        </div>

        {/* --- PART 2: SECTION: Placements --- */}
        <div className="bg-white dark:bg-gray-800/90 border border-slate-200/80 dark:border-gray-700/80 rounded-3xl p-2 md:p-4 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Placement Intro */}
          <div className="text-center max-w-5xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900">
              Placements
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Our Placements Speak Louder Than Our Marketing
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              We don't just teach code, frameworks, or theory, we build
              professional futures. Join{" "}
              <strong className="text-blue-600 dark:text-blue-400">
                480+ alumni
              </strong>{" "}
              now working across some of the world's most recognized technology
              companies.
            </p>
          </div>

          {/* Trusted Tech Leaders Badges */}
          <div className="space-y-2 pt-2">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trusted by Global Tech Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1 md:gap-4">
              {techCompanies.map((company, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200/80 dark:border-gray-700 text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-300 tracking-wider shadow-2xs hover:border-blue-500 transition-colors"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>

          {/* Alumni Stories Teaser Bar */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <FaCommentAlt className="text-sm" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Alumni Stories
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Hear real success stories from our graduates working globally.
                </p>
              </div>
            </div>
            <Link
              to="/alumni-stories"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Read Success Stories</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {/* Final Dream Career CTA Box */}
          <div className="pt-6 border-t border-slate-100 dark:border-gray-700 text-center space-y-6">
            <div className="space-y-2">
              <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Your Dream Career Is Just One Step Away
              </h4>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Join our next cohort and get personalized career coaching,
                portfolio reviews, and direct referrals to hiring partners.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/admission"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-98"
              >
                <span>Apply for Admission</span>
                <FaArrowRight className="text-xs" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 dark:border-gray-700 hover:border-blue-500 text-slate-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs md:text-sm rounded-xl transition-all duration-300 bg-white/50 dark:bg-gray-800/50"
              >
                <span>Talk to an Expert</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
