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
    <section className="relative py-20 text-black dark:text-white bg-gradient-to-b from-white to-indigo-50/30 dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-300">
      {/* Decorative Background Elements (Adaptive) */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* --- Section Header --- */}
        <div className="text-center max-w-7xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-sm font-semibold mb-4 border border-indigo-200 dark:border-indigo-800">
            <TrophyOutlined /> Scholarship Program 2026
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white text-center">
            Unlock Your Future with Eklabya
          </h2>
          <p className="text-black dark:text-white leading-relaxed">
            The Eklabya Scholarship Exam is a prestigious merit-based online
            initiative created to empower talented and ambitious students. This
            examination offers deserving learners an opportunity to demonstrate
            their academic excellence while gaining access to financial support
            for higher education. Through Eklabya, students can confidently
            take the next step toward career success by enrolling in
            <strong> professional certification courses</strong> online that are designed to meet
            modern industry standards. Eklabya also provides advanced learning
            opportunities through globally recognized <strong>SAP online certification
            courses</strong>, helping students build job-ready skills and enhance their
            professional credibility. With expert guidance, flexible online
            learning, and career-focused programs, Eklabya bridges the gap
            between education and employment. Participate in the Eklabya
            Scholarship Exam today and unlock a future filled with knowledge,
            growth, and limitless career possibilities.
          </p>
        </div>

        {/* --- Two Column Feature Grid --- */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Column 1: Eligibility */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-lg dark:hover:bg-gray-750 transition-all duration-300 group">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
              <GlobalOutlined />
            </div>
            <h3 className="text-xl font-bold mb-4">Eligibility Criteria</h3>
            <p className=" mb-6">
              To apply for the Eklabya Scholarship 2026, candidates must meet
              the minimum academic requirements as specified below:
            </p>
            <ul className="space-y-4">
              {[
                "Currently enrolled in Undergraduate or Postgraduate studies.",
                "Students from recognized schools, colleges, or universities.",
                "Must have a valid internet connection for the online exam.",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 "
                >
                  <CheckCircleFilled className="text-blue-500 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Evaluation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-lg dark:hover:bg-gray-750 transition-all duration-300 group">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
              <SafetyCertificateFilled />
            </div>
            <h3 className="text-xl font-bold mb-4">
              Evaluation Process
            </h3>
            <p className="mb-6">
              Our evaluation process is fully digital, time-bound, and
              transparent, ensuring equal opportunity for all participants.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 ">
                <ClockCircleFilled className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0" />
                <span>
                  <strong className="">
                    Time-Bound:
                  </strong>{" "}
                  Each question has a fixed time limit. Speed and accuracy are
                  key.
                </span>
              </li>
              <li className="flex items-start gap-3 ">
                <SafetyCertificateFilled className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0" />
                <span>
                  <strong className="">
                    Integrity:
                  </strong>{" "}
                  Advanced monitoring systems prevent malpractice during the
                  exam.
                </span>
              </li>
              <li className="flex items-start gap-3 ">
                <TrophyOutlined className="text-purple-500 dark:text-purple-400 mt-1 flex-shrink-0" />
                <span>
                  <strong className="">
                    Merit-Based:
                  </strong>{" "}
                  Scores are auto-calculated, and awards are granted based on
                  ranking.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- CTA Banner --- */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 dark:bg-black text-white shadow-2xl border border-transparent dark:border-gray-800">
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-90 dark:opacity-80"></div>

          <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                Ready to prove your potential?
              </h3>
              <p className="text-indigo-100 text-lg">
                The Eklabya Scholarship Exam 2026 offers you a reliable
                platform to showcase your abilities and secure a brighter
                academic future.
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => navigate("/scholarship-test")}
                className="group bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2"
              >
                Take Assessment
                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Abstract Shapes for CTA */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </section>
  );
};

export default Assessment;
