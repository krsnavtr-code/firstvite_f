import React from "react";
import { FaBook, FaUsers, FaGraduationCap, FaBriefcase } from "react-icons/fa";
import { motion } from "framer-motion";

const stats = [
  {
    id: 1,
    name: "Professional Courses",
    value: "110+",
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
    name: "Job Placement",
    value: "98%",
    icon: FaBriefcase,
    color: "from-amber-400 to-orange-500",
  },
];

const Stats = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-gray-900 py-24">
      {/* --- Decorative Background Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12">
          <h2 className="text-sm font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
            Our Impact
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Empowering growth with every milestone
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative group p-8 rounded-2xl bg-white/70 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-xl transition-all duration-300"
            >
              {/* --- Icon Container with Gradient Border --- */}
              <div
                className={`mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}
              >
                <stat.icon className="h-8 w-8" aria-hidden="true" />
              </div>

              {/* --- Content --- */}
              <div className="mt-6">
                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </h3>
                <p className="mt-2 text-base font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {stat.name}
                </p>
              </div>

              {/* --- Hover Decoration --- */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${stat.color} transition-all duration-500 group-hover:w-full rounded-b-2xl`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
