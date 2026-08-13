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
    <section className="relative py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-2 lg:px-4">
        {/* Success Stories */}
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {studentStories.map((story, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col"
              >
                <Quote className="w-6 h-6 text-blue-100 dark:text-blue-900/30 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed mb-8 flex-grow">
                  "{story.quote}"
                </p>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-50 dark:border-gray-700">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-10 h-10 rounded-full object-cover shadow-md"
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

       
      </div>
    </section>
  );
};

export default StudentPlacements;
