import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaRegClock,
  FaArrowRight,
  FaLaptopCode,
  FaBookOpen,
  FaCheckCircle,
  FaUserGraduate,
} from "react-icons/fa";
import axios from "../../api/axios";
import { getCardBgColor } from "../../utils/gradients";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const CourseCard = ({ course }) => {
  const [imageState, setImageState] = useState({
    url: "",
    error: false,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!course?.thumbnail) {
        if (isMounted) {
          setImageState({
            url: "/images/course-placeholder.jpg",
            error: false,
            loading: false,
          });
        }
        return;
      }

      let url = course.thumbnail;

      if (
        !url.startsWith("http") &&
        !url.startsWith("https") &&
        !url.startsWith("//")
      ) {
        const cleanPath = url.replace(/^\/+/, "");
        const baseUrl = API_BASE_URL || "";
        url = `${baseUrl}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
      }

      if (isMounted) {
        setImageState({
          url: url,
          error: false,
          loading: true,
        });
      }

      const img = new Image();

      const handleLoad = () => {
        if (isMounted) {
          setImageState({
            url: url,
            error: false,
            loading: false,
          });
        }
      };

      const handleError = () => {
        if (isMounted) {
          setImageState({
            url: "/images/course-placeholder.jpg",
            error: true,
            loading: false,
          });
        }
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = url;

      const timeoutId = setTimeout(() => {
        if (isMounted) {
          const imgElement = new Image();
          imgElement.onload = () => {};
          imgElement.onerror = () => {
            if (isMounted) {
              setImageState({
                url: "/images/course-placeholder.jpg",
                error: true,
                loading: false,
              });
            }
          };
          imgElement.src = url;
        }
      }, 5000);

      return () => {
        isMounted = false;
        img.onload = null;
        img.onerror = null;
        clearTimeout(timeoutId);
      };
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [course?._id, course?.thumbnail]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars || (i === fullStars + 1 && hasHalfStar)) {
        stars.push(<FaStar key={i} className="text-amber-400 text-xs" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-amber-400 text-xs" />);
      }
    }
    return stars;
  };

  const bgColor = getCardBgColor(course);

  return (
    <div
      className={`${bgColor} group rounded-2xl bg-white dark:bg-gray-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col`}
    >
      <Link
        to={`/course/${course.slug || course._id}`}
        className="flex flex-col h-full"
      >
        <div className="relative w-full h-48 bg-slate-100 dark:bg-gray-900 overflow-hidden">
          {imageState.loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse rounded-full h-10 w-10 border-3 border-t-blue-500 border-gray-300"></div>
            </div>
          ) : imageState.error || !course.thumbnail ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
              No preview available
            </div>
          ) : (
            <img
              src={imageState.url}
              alt={course.title || "Course image"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          {course.isFeatured && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
              Featured
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">{renderStars(course.rating || 4)}</div>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {course.shortDescription
                ?.replace(/^<p>/i, "")
                .replace(/<\/p>$/i, "")}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
              <FaRegClock className="mr-1.5 text-blue-500" />
              {course.duration || "10-16"} Weeks
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900">
              {course.level || "Beginner Friendly"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await axios.get("/courses", {
          params: {
            showOnHome: "true",
            limit: 8,
            sort: "-createdAt",
            isPublished: "true",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let fetchedCourses = [];
        if (Array.isArray(response.data)) {
          fetchedCourses = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          fetchedCourses = response.data.data;
        } else if (response.data && response.data.courses) {
          fetchedCourses = response.data.courses;
        } else {
          throw new Error("Invalid response format from server");
        }

        const featuredCourses = fetchedCourses.filter(
          (course) => course.showOnHome !== false,
        );

        setCourses(featuredCourses);
      } catch (err) {
        console.error("Error fetching featured courses:", err);
        setError("Failed to load featured courses");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <section className="py-6 md:py-6 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-6xl mx-auto mb-4 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <FaLaptopCode className="text-xs" />Course Overview
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Online Certification Courses Built for Real Careers
          </h2>
        </div>

        {/* --- COMPLETE CONTENT INTEGRATED CLEANLY --- */}
        <div className="bg-slate-50 dark:bg-gray-800/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-1 md:p-6 mb-4 space-y-8 shadow-sm">
          {/* Main Intro Paragraph with Domain List Highlights */}
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Eklabya gives you a range of job-focused online certification
            courses that are tailored to the real skills that bosses are after
            in 2026, not just some generic theory to be honest. The selection is{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              Data Science, Analytics & Power BI
            </strong>
            ,{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              Machine Learning & AI Certification
            </strong>
            ,{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              Full Stack Web Development using MERN
            </strong>{" "}
            — we're not just talking the basics here,{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              Frontend Development with HTML, CSS, JS & React
            </strong>{" "}
            — the works,{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              SAP ABAP Certification
            </strong>{" "}
            — the good stuff, and{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              Digital Marketing Strategy & Mastery
            </strong>{" "}
            — not just the basics, and all of these are built around a complete
            project, a real project to work on rather than just a bunch of
            videos.
          </p>

          {/* 3 Core Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 font-bold text-sm">
                ⏱️
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Learn at your own speed
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Most courses take 10-16 weeks, with a mix of self study and live
                one on one sessions with a teacher, so you can get on with your
                life, whether that's a job, uni, or looking after the family —
                without getting left behind.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 font-bold text-sm">
                🛠️
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Build, don't just watch
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every program includes hands-on projects, from Power BI
                dashboards to full MERN-stack applications, so you leave with a
                portfolio, not just a certificate.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 font-bold text-sm">
                🎯
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Start where you are
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every course listed is designed for beginners, so prior
                experience isn't a prerequisite, commitment is.
              </p>
            </div>
          </div>

          {/* Concluding Paragraph */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "Whether you're a student preparing for your first job, a working
              professional pivoting industries, or an entrepreneur building
              technical fluency, Eklabya's online certification courses are
              structured to get you from 'learning' to 'employable', fast."
            </p>
          </div>
        </div>

        {/* Courses Grid / States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-slate-200 dark:bg-gray-700"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="flex justify-between pt-4">
                    <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-red-500 font-semibold text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-4 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 active:scale-98"
          >
            <span>View All Courses</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
