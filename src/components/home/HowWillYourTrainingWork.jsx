import React from "react";
import {
  FaVideo,
  FaClipboardCheck,
  FaBullseye,
  FaComments,
  FaFileAlt,
  FaCertificate,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaVideo className="text-3xl text-blue-500 dark:text-blue-400" />,
    title: "Learn from Experts",
    desc: "Watch in-depth video lectures designed by industry professionals to master core concepts",
  },
  {
    icon: <FaClipboardCheck className="text-3xl text-blue-500 dark:text-blue-400" />,
    title: "Test Yourself",
    desc: "Assess your progress with regular quizzes, assignments, and module-wise tests",
  },
  {
    icon: <FaBullseye className="text-3xl text-blue-500 dark:text-blue-400" />,
    title: "Hands-on practice",
    desc: "Work on real-world projects and assignments using tools, software, and integrated coding platforms.",
  },
  {
    icon: <FaComments className="text-3xl text-blue-500 dark:text-blue-400" />,
    title: "1:1 doubt solving",
    desc: "Get personalized support from experts via live doubt-clearing sessions or within 24 hours on our forums.",
  },
  {
    icon: <FaFileAlt className="text-3xl text-blue-500 dark:text-blue-400" />,
    title: "Take final exam",
    desc: "Conclude your training with a comprehensive final assessment to test your full understanding",
  },
  {
    icon: <FaCertificate className="text-3xl text-blue-500 dark:text-blue-400" />,
    title: "Get certified",
    desc: "Receive a recognized certificate from FirstVITE (NSDC/NIELIT partnered) upon successful course completion",
  },
];

const HowWillYourTrainingWork = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black dark:text-white sm:text-4xl">
          How will your training work? – with FirstVITE
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md dark:shadow-none">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-start space-y-3 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">{step.icon}</div>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {step.title}
            </h3>
            <p className="text-sm text-black dark:text-white">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowWillYourTrainingWork;
