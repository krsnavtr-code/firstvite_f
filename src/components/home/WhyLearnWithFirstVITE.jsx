import React from "react";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "../../styles/typography.css";

const data = [
  {
    benefit: "Government-certified courses (NSDC, NIELIT)",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "Dedicated placement support",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "3x more visibility with verified certification ",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "Direct job & internship opportunities",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "Industry-led curriculum & hands-on projects",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "Live doubt-clearing sessions",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "Courses in Hindi, English & more",
    firstVITE: true,
    others: false,
    youtube: false,
  },
  {
    benefit: "4 Million+ trusted learners",
    firstVITE: true,
    others: false,
    youtube: false,
  },
];

const renderIcon = (value) => {
  if (value === true)
    return <FaCheckCircle className="text-green-500 dark:text-green-400 text-xl mx-auto" />;
  if (value === false)
    return <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl mx-auto" />;
  return <span className="text-gray-400 dark:text-gray-600 text-center">—</span>;
};

const WhyLearnWithFirstVITE = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-lg-mobile text-xl-tablet text-xl-desktop font-bold text-gray-900 dark:text-white text-thin-bold">
          Why Learn with FirstVITE?
        </h2>
        <p className="mt-4 text-xs-mobile text-sm-tablet text-sm-desktop text-thin text-gray-600 dark:text-gray-300">
          Compare our platform with others and see why we stand out
        </p>
      </div>

      <div className="space-y-6">
        {/* Desktop view - Table layout */}
        <div className="hidden md:block">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-none overflow-hidden hover:shadow-lg dark:hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse text-gray-900 dark:text-white">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-thin text-xs-mobile text-sm-tablet text-sm-desktop">
                    <th className="px-4 py-3 text-left">Benefits</th>
                    <th className="px-4 py-3">FirstVITE</th>
                    <th className="px-4 py-3">Other Platforms</th>
                    <th className="px-4 py-3">YouTube</th>
                  </tr>
                </thead>
                <tbody className="text-center text-thin text-xs-mobile text-sm-tablet text-sm-desktop">
                  {data.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-50 dark:bg-gray-700"
                      }`}
                    >
                      <td className="px-4 py-3 text-left font-medium text-thin-bold">
                        {row.benefit}
                      </td>
                      <td className="px-4 py-3">{renderIcon(row.firstVITE)}</td>
                      <td className="px-4 py-3">{renderIcon(row.others)}</td>
                      <td className="px-4 py-3">{renderIcon(row.youtube)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile view - Card layout */}
        <div className="md:hidden space-y-6">
          {data.map((row, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="p-4 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {row.benefit}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      FirstVITE
                    </span>
                    {renderIcon(row.firstVITE)}
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      Other Platforms
                    </span>
                    {renderIcon(row.others)}
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      YouTube
                    </span>
                    {renderIcon(row.youtube)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyLearnWithFirstVITE;
