import React from "react";
import { getCardBgColor } from "../../utils/gradients";

const Content = () => {
  const bgColor = getCardBgColor();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl">
          Welcome to FirstVITE – Your Online Learning Partner
        </h2>
        <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          FirstVITE is a trusted online learning platform where you can pursue
          certified courses and degree programs from the comfort of your home.
          Our mission is to make quality education accessible to students and
          working professionals — without the limitations of time, location, or
          background.
        </p>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Whether you want to build a career in Digital Marketing, Data Science,
          Business Administration, or Information Technology, we offer flexible,
          career-oriented programs tailored to your goals and schedule.
        </p>
      </div>

      {/* Why Choose FirstVITE */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-black dark:text-white mb-6 text-center">
          Why Choose FirstVITE?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            className={`${bgColor} p-6 rounded-lg shadow dark:shadow-none hover:shadow-md dark:hover:shadow-lg transition`}
          >
            <h4 className="font-bold mb-2 text-gray-900 dark:text-white">
              💻 100% Online Learning
            </h4>
            <p className="text-gray-800 dark:text-gray-300">
              Attend live interactive sessions or learn at your own pace with
              recorded lectures.
            </p>
          </div>
          <div
            className={`${bgColor} p-6 rounded-lg shadow dark:shadow-none hover:shadow-md dark:hover:shadow-lg transition`}
          >
            <h4 className="font-bold mb-2 text-gray-900 dark:text-white">
              🎯 Career Support
            </h4>
            <p className="text-gray-800 dark:text-gray-300">
              Get professional assistance with job placements, resume building,
              and interview preparation.
            </p>
          </div>
          <div
            className={`${bgColor} p-6 rounded-lg shadow dark:shadow-none hover:shadow-md dark:hover:shadow-lg transition`}
          >
            <h4 className="font-bold mb-2 text-gray-900 dark:text-white">👨‍🏫 Expert Trainers</h4>
            <p className="text-gray-800 dark:text-gray-300">
              Learn from highly experienced trainers and industry professionals
              with hands-on expertise.
            </p>
          </div>
          <div
            className={`${bgColor} p-6 rounded-lg shadow dark:shadow-none hover:shadow-md dark:hover:shadow-lg transition`}
          >
            <h4 className="font-bold mb-2 text-gray-900 dark:text-white">📜 Recognized Certification</h4>
            <p className="text-gray-800 dark:text-gray-300">
              Receive valid, verifiable certificates upon successful course
              completion.
            </p>
          </div>
        </div>
      </div>

      {/* Start Learning in 3 Easy Steps */}
      <div className={`${bgColor} mb-16 text-gray-900 dark:text-white p-6 rounded-lg shadow dark:shadow-none hover:shadow-md dark:hover:shadow-lg transition`}>
        <h3 className="text-2xl font-semibold text-black dark:text-white mb-6 text-center">
          Start Learning in 3 Easy Steps
        </h3>
        <ol className="space-y-6 max-w-4xl mx-auto text-lg text-black dark:text-white list-decimal list-inside">
          <li>
            <strong>Browse Courses:</strong> Explore a wide range of 100+
            career-ready programs across business, technology, marketing, and
            more.
          </li>
          <li>
            <strong>Enroll Online:</strong> Choose your preferred course and pay
            conveniently via credit/debit card, EMI options, or education loans.
          </li>
          <li>
            <strong>Start Learning:</strong> Access live and recorded classes,
            complete assignments, take assessments, and earn a recognized
            certificate.
          </li>
        </ol>
      </div>

      {/* Join Learners */}
      <div className="text-center mb-16">
        <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Join 10,000+ Successful Learners Across India
        </h3>
        <p className="text-lg text-black dark:text-white max-w-3xl mx-auto">
          Thousands of learners have upskilled through our practical and
          flexible programs. Whether you're a student looking to get ahead or a
          working professional aiming for a career shift, our online education
          solutions help you stay competitive in today's fast-changing job
          market.
        </p>
        <p className="mt-4 text-lg text-black dark:text-white max-w-3xl mx-auto">
          From up-to-date course content and expert mentorship to placement
          assistance and lifetime access to learning material — FirstVITE is
          your complete learning companion.
        </p>
      </div>

      {/* Call to Action */}
      <div className={`${bgColor} p-8 rounded-xl shadow-lg dark:shadow-none text-center`}>
        <h3 className="text-2xl font-bold text-blue-800 dark:text-white mb-4">
          Enroll Now & Start Your Learning Journey Today!
        </h3>
        <p className="text-lg text-black dark:text-white max-w-2xl mx-auto">
          Empower your future with FirstVITE — where education meets
          opportunity. No classroom needed. Just a device, internet, and the
          passion to grow.
        </p>
        <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
          Explore Courses
        </button>
      </div>
    </div>
  );
};

export default Content;
