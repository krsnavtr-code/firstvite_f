import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrophyOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  SafetyCertificateFilled,
  ArrowRightOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const Assessment = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-6 text-black dark:text-white bg-gradient-to-b from-white to-indigo-50/30 dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* --- Section Header & Overview --- */}
        <div className="text-center max-w-7xl mx-auto mb-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <TrophyOutlined /> Scholarship Program 2026
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Unlock Your Future with the Eklabya Scholarship Exam
          </h2>

          <div className="bg-slate-50 dark:bg-gray-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 md:p-4 text-left space-y-2 shadow-sm">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              The Eklabya Scholarship Exam is a merit-based online initiative
              designed to reward talented, ambitious students with real
              financial support for their education. It's a chance to prove your
              academic ability and turn that performance into tangible savings
              on a professional certification course, no financial background
              required, just genuine merit.
            </p>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Students who get scholarships can use it to study in any of
              Eklabya's globally recognized online certification courses. This
              way the students would get a chance to build job ready skills
              without worrying about the cost of certification. We aim to close
              the gap between ambition and success by providing this scholarship
              along with expert mentorship and flexible online learning.
            </p>
          </div>
        </div>

        {/* --- Two Column Feature Grid (Eligibility & Evaluation) --- */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-6 mb-4">
          {/* Column 1: Eligibility Criteria */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 md:p-4 shadow-xs border border-slate-200/80 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl group-hover:scale-105 transition-transform">
                <GlobalOutlined />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-3">
                Eligibility Criteria
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Students who are currently pursuing any Undergraduate or
                Postgraduate studies at any government recognized school,
                college, or university, with a good internet connection for the
                online exam (can also give it on center).
              </p>

              <ul className="space-y-3.5">
                {[
                  "Students who are currently pursuing any Undergraduate or Postgraduate studies",
                  "The students should be study at any government recognized school, college, or university",
                  "Students should have a good internet connection for the online exam, they can also give it on center",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircleFilled className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0 text-base" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: Evaluation Process */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 md:p-4 shadow-xs border border-slate-200/80 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl group-hover:scale-105 transition-transform">
                <SafetyCertificateFilled />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-3">
                Evaluation Process
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Our evaluation is fully digital, timebound, and transparent.
                Every candidate gets an equal shot.
              </p>

              <ul className="space-y-3.5">
                <li className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                  <ClockCircleFilled className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0 text-base" />
                  <span className="leading-snug">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      Time-Bound:
                    </strong>{" "}
                    Each test follows strict digital constraints to maintain
                    fairness.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                  <SafetyCertificateFilled className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0 text-base" />
                  <span className="leading-snug">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      Transparent:
                    </strong>{" "}
                    Fully digital processing ensures complete clarity and equal
                    opportunity.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                  <TrophyOutlined className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0 text-base" />
                  <span className="leading-snug">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      Merit-Based:
                    </strong>{" "}
                    Rewards are granted strictly based on academic performance.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- CTA Banner --- */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-black text-white shadow-2xl border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-90 dark:opacity-80"></div>

          <div className="relative z-10 px-6 py-10 md:py-14 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Ready to prove your potential?
              </h3>
              <p className="text-indigo-100 text-xs sm:text-sm md:text-base font-normal leading-relaxed">
                The Eklabya Scholarship Exam 2026 gives you a fair, reliable
                platform to showcase your ability and secure a brighter academic
                future.
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => navigate("/scholarship-test")}
                className="group bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 active:scale-98"
              >
                <span>Take Assessment</span>
                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default Assessment;
