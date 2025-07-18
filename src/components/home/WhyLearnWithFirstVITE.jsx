import React, { useState } from "react";

import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import "./WhyLearnWithFirstVITE.css";
import "../../styles/typography.css";

const data = [
  {
    benefit: "FirstVITE ISO certified certificate",
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
  const iconClass =
    "text-xl mx-auto transition-transform duration-300 hover:scale-110";

  if (value === true)
    return (
      <FaCheckCircle
        className={`text-green-500 dark:text-green-400 ${iconClass}`}
      />
    );
  if (value === false)
    return (
      <FaTimesCircle
        className={`text-red-500 dark:text-red-400 ${iconClass}`}
      />
    );
  return (
    <span className="text-gray-400 dark:text-gray-600 text-center">—</span>
  );
};

const WhyLearnWithFirstVITE = () => {
  const [comparisonData, setComparisonData] = useState(data);
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is visible
        rootMargin: "0px 0px -50px 0px", // Adjust this to control when the animation triggers
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
    };
  }, []);

  const toggleValue = (rowIndex, column) => {
    const cell = document.querySelector(
      `[data-row="${rowIndex}"][data-column="${column}"] .flip-icon`
    );
    if (cell) {
      cell.classList.add("flip");
      setTimeout(() => cell.classList.remove("flip"), 500);
    }

    setTimeout(() => {
      setComparisonData((prevData) => {
        const newData = [...prevData];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [column]: !newData[rowIndex][column],
        };
        return newData;
      });
    }, 150);
  };

  const handleCellClick = (e, rowIndex, column) => {
    // Prevent toggling when clicking on the benefit column
    if (column === "benefit") return;
    toggleValue(rowIndex, column);
  };
  return (
    <div
      ref={componentRef}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ${
        isVisible ? "opacity-100 visible" : "opacity-0"
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-lg-mobile text-xl-tablet text-xl-desktop font-bold text-black dark:text-white text-thin-bold">
          Why Learn with FirstVITE?
        </h2>
        <p className="mt-4 text-xs-mobile text-sm-tablet text-sm-desktop text-thin text-black dark:text-white">
          Compare our platform with others and see why we stand out
        </p>
      </div>

      <div className="w-full">
        {/* Desktop view - Table layout */}
        <div className="hidden md:block w-full">
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-none overflow-hidden hover:shadow-lg dark:hover:shadow-lg transition-all duration-300">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-black dark:text-white">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white text-thin text-xs-mobile text-sm-tablet text-sm-desktop">
                    <th className="w-1/2 px-4 py-3 text-left">Benefits</th>
                    <th className="w-1/6 px-4 py-3">FirstVITE</th>
                    <th className="w-1/6 px-4 py-3">Other Platforms</th>
                    <th className="w-1/6 px-4 py-3">YouTube</th>
                  </tr>
                </thead>
                <tbody className="text-center text-thin text-xs-mobile text-sm-tablet text-sm-desktop">
                  {comparisonData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-50 dark:bg-gray-700"
                      } hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer`}
                    >
                      <td
                        className="w-1/2 px-4 py-3 text-left font-medium text-thin-bold"
                        onClick={(e) => handleCellClick(e, idx, "benefit")}
                      >
                        {row.benefit}
                      </td>
                      <td
                        className="w-1/6 px-4 py-3 text-center"
                        onClick={(e) => handleCellClick(e, idx, "firstVITE")}
                        data-row={idx}
                        data-column="firstVITE"
                      >
                        <div
                          className="flip-icon-container"
                          style={{ "--delay": idx % 3 }}
                        >
                          {renderIcon(row.firstVITE)}
                        </div>
                      </td>
                      <td
                        className="w-1/6 px-4 py-3 text-center"
                        onClick={(e) => handleCellClick(e, idx, "others")}
                        data-row={idx}
                        data-column="others"
                      >
                        <div
                          className="flip-icon-container"
                          style={{ "--delay": (idx % 3) + 1 }}
                        >
                          {renderIcon(row.others)}
                        </div>
                      </td>
                      <td
                        className="w-1/6 px-4 py-3 text-center"
                        onClick={(e) => handleCellClick(e, idx, "youtube")}
                        data-row={idx}
                        data-column="youtube"
                      >
                        <div
                          className="flip-icon-container"
                          style={{ "--delay": (idx % 3) + 2 }}
                        >
                          {renderIcon(row.youtube)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile view - Card layout */}
        <div className="md:hidden space-y-6">
          {comparisonData.map((row, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="p-4 space-y-4">
                <h3 className="text-base font-semibold text-black dark:text-white">
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
