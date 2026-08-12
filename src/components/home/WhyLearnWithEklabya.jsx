import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaShieldAlt } from "react-icons/fa";
import "../../styles/typography.css";

const data = [
  {
    benefit: "Eklabya ISO certified certificate",
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
    benefit: "3x more visibility with verified certification",
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
    "text-lg md:text-xl transition-transform duration-300 hover:scale-125";

  if (value === true)
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
        <FaCheckCircle
          className={`text-emerald-500 dark:text-emerald-400 ${iconClass}`}
        />
      </div>
    );
  if (value === false)
    return (
      <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mx-auto border border-rose-200/60 dark:border-rose-800/60 shadow-2xs">
        <FaTimesCircle
          className={`text-rose-500 dark:text-rose-400 ${iconClass}`}
        />
      </div>
    );
  return <span className="text-gray-300 dark:text-gray-600 font-bold">—</span>;
};

const WhyLearnWithEklabya = () => {
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
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
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
      `[data-row="${rowIndex}"][data-column="${column}"] .flip-icon`,
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

  return (
    <section
      ref={componentRef}
      className={`py-2 md:py-4 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-all duration-1000 ${
        isVisible ? "opacity-100 visible" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="w-full">
          {/* Desktop view - Premium Table layout */}
          <div className="hidden md:block w-full">
            <div className="w-full bg-white dark:bg-gray-800/90 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden backdrop-blur-md">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-gray-900/80 text-slate-900 dark:text-white text-xs uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                      <th className="w-1/2 px-6 py-1.5 text-left">
                        Key Benefits & Features
                      </th>
                      <th className="w-1/6 px-4 py-1.5 text-center text-blue-600 dark:text-blue-400 font-black">
                        Eklabya
                      </th>
                      <th className="w-1/6 px-4 py-1.5 text-center text-slate-500 dark:text-slate-400">
                        Other Platforms
                      </th>
                      <th className="w-1/6 px-4 py-1.5 text-center text-slate-500 dark:text-slate-400">
                        YouTube
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {comparisonData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors duration-150 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-gray-800/40"
                            : "bg-slate-50/40 dark:bg-gray-800/80"
                        }`}
                      >
                        <td className="w-1/2 px-6 py-1.5 text-left font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {row.benefit}
                        </td>
                        <td
                          className="w-1/6 px-4 py-1.5 text-center"
                          data-row={idx}
                          data-column="firstVITE"
                          onClick={(e) => handleCellClick(e, idx, "firstVITE")}
                        >
                          <div
                            className="flip-icon-container cursor-pointer"
                            style={{ "--delay": idx % 3 }}
                          >
                            {renderIcon(row.firstVITE)}
                          </div>
                        </td>
                        <td
                          className="w-1/6 px-4 py-1.5 text-center"
                          data-row={idx}
                          data-column="others"
                          onClick={(e) => handleCellClick(e, idx, "others")}
                        >
                          <div
                            className="flip-icon-container cursor-pointer"
                            style={{ "--delay": (idx % 3) + 1 }}
                          >
                            {renderIcon(row.others)}
                          </div>
                        </td>
                        <td
                          className="w-1/6 px-4 py-1.5 text-center"
                          data-row={idx}
                          data-column="youtube"
                          onClick={(e) => handleCellClick(e, idx, "youtube")}
                        >
                          <div
                            className="flip-icon-container cursor-pointer"
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

          {/* Mobile view - Modern Card stack layout */}
          <div className="md:hidden space-y-0.5">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl p-2 md:p-3 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-2 transition-all duration-300"
              >
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                  {row.benefit}
                </h3>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-700/60">
                  {/* Eklabya */}
                  <div
                    className="flex flex-col items-center justify-center p-1 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60"
                    onClick={() => toggleValue(idx, "firstVITE")}
                  >
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 mb-1.5">
                      Eklabya
                    </span>
                    {renderIcon(row.firstVITE)}
                  </div>

                  {/* Others */}
                  <div
                    className="flex flex-col items-center justify-center p-1 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200/60 dark:border-slate-800"
                    onClick={() => toggleValue(idx, "others")}
                  >
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      Others
                    </span>
                    {renderIcon(row.others)}
                  </div>

                  {/* YouTube */}
                  <div
                    className="flex flex-col items-center justify-center p-1 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200/60 dark:border-slate-800"
                    onClick={() => toggleValue(idx, "youtube")}
                  >
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                      YouTube
                    </span>
                    {renderIcon(row.youtube)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLearnWithEklabya;
