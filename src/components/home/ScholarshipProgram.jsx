import React from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaRocket,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const WhyEklabya = () => {
  return (
    <section className="py-6 md:py-10 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Section Header --- */}
        <div className="text-center max-w-3xl mx-auto mb-1 space-y-1">
          {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            <FaShieldAlt className="w-3.5 h-3.5" />Why Learn with
            Eklabya
          </div> */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Why Learn with Eklabya?
          </h2>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center mt-2">
          {/* Left Column: Core Narrative */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-2 md:p-3 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                Eklabya isn't just your run of the mill course library, it's
                built around one single purpose : making learning actually lead
                to a job. Through the Eklabya Scholarship Exam we help deserving
                students get some real financial backing. All we consider is
                their talent. We've also got job-focused online courses, where
                every learner gets a curriculum that's been tailored to the jobs
                that are currently up for grabs, not some outdated syllabus that
                was written five years ago and never changed.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-3xl p-2 md:p-3 text-white shadow-xl space-y-1">
              <h3 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                <FaRocket className="text-amber-400" /> What Sets Us Apart
              </h3>
              <p className="text-xs md:text-sm text-blue-100 leading-relaxed font-normal">
                The key thing that sets Eklabya apart from a normal online
                course site or some free YouTube videos is plain to see : we
                build our programs to help you get a job, not just finish a
                course. Every program we offer will include some
                industry-relevant projects that employers actually care about,
                some verified certification to give you that extra boost, and a
                bit of direct exposure to the people who actually do the hiring
                . So when you finish one of our courses you'll have a heap more
                on your CV, not just a list that says you "completed the
                course”.
              </p>
            </div>
          </div>

          {/* Right Column: Highlight Card & Quick Actions */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 md:p-3 shadow-xl border border-slate-200/80 dark:border-slate-700 space-y-6 relative overflow-hidden">

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                  Career First Approach
                </span>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-3 tracking-tight">
                  Ready to transform your career?
                </h3>
              </div>

              <div className="space-y-3 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                  <span>
                    Real financial backing through merit scholarships.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                  <span>
                    Up-to-date curricula matching active job market demands.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                  <span>Direct exposure to industry hiring managers.</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  to="/courses"
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Explore Job-Focused Courses</span>
                  <FaArrowRight className="text-xs" />
                </Link>
                <Link
                  to="/scholarship"
                  className="w-full text-center border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold py-2 px-3 rounded-xl transition-all duration-300 flex items-center justify-center bg-white/50 dark:bg-gray-800/50"
                >
                  Learn About Scholarship
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyEklabya;
