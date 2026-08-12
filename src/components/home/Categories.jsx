import React, { useState, useEffect } from "react";
import { FaImage, FaArrowRight, FaLayerGroup } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCategories as getCategoriesFromApi } from "../../api/categoryApi";
import { getCoursesByCategory } from "../../api/courseApi";
import { getCardBgColor } from "../../utils/gradients";
import "../Banner.css";
import "../../styles/typography.css";

// Helper function to get the full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${imagePath}`;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await getCategoriesFromApi({
          showOnHome: true,
          limit: 6,
          sort: "-courseCount",
          fields: "_id,name,slug,courseCount,image,description,showOnHome",
        });

        const categoriesData = Array.isArray(response)
          ? response
          : response.data || [];

        const uniqueCategoriesMap = new Map();
        categoriesData.forEach((cat) => {
          if (cat && cat._id && !uniqueCategoriesMap.has(cat._id)) {
            uniqueCategoriesMap.set(cat._id, cat);
          }
        });

        const uniqueCategories = Array.from(uniqueCategoriesMap.values());

        const categoriesWithCount = await Promise.all(
          uniqueCategories.map(async (category) => {
            if (
              category.courseCount === undefined ||
              category.courseCount === null
            ) {
              try {
                const courses = await getCoursesByCategory(category._id);
                return {
                  ...category,
                  courseCount: Array.isArray(courses) ? courses.length : 0,
                };
              } catch (err) {
                console.error(
                  `Error fetching courses for category ${category.name}:`,
                  err,
                );
                return { ...category, courseCount: 0 };
              }
            }
            return category;
          }),
        );

        const sortedCategories = categoriesWithCount
          .sort((a, b) => (b.courseCount || 0) - (a.courseCount || 0))
          .slice(0, 6);

        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Memoized CategoryImage component
  const CategoryImage = React.memo(({ category }) => {
    const [imageError, setImageError] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
      setImageError(false);
      if (category?.image) {
        const url = getImageUrl(category.image);
        const img = new Image();
        img.onload = () => setImageUrl(url);
        img.onerror = () => setImageError(true);
        img.src = url;

        return () => {
          img.onload = null;
          img.onerror = null;
        };
      } else {
        setImageError(true);
      }
    }, [category?.image]);

    return (
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-50 dark:bg-gray-800 border border-slate-100 dark:border-slate-700/80 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={category?.name || "Category"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-blue-500 dark:text-blue-400">
            <FaImage className="text-xl" />
          </div>
        )}
      </div>
    );
  });

  if (loading) {
    return (
      <section className="py-6 bg-slate-50/50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="h-6 bg-slate-200 dark:bg-gray-800 rounded-full w-32 mx-auto animate-pulse"></div>
            <div className="h-8 bg-slate-200 dark:bg-gray-800 rounded-xl w-3/4 mx-auto animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded-lg w-5/6 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 animate-pulse space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6 bg-slate-50/50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl max-w-md mx-auto mb-4 text-sm font-semibold">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <FaLayerGroup className="text-xs" /> Skill Categories
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Courses by Category
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Eklabya's course catalog is organized around the skill areas
            employers are hiring for right now, not a generic subject list. Pick
            a category and go straight to jobrelevant, structured learning.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/courses/category/${category.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className={`group relative p-3 md:p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 ${getCardBgColor(
                  category,
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CategoryImage category={category} />
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {category.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {category.courseCount || 0} active courses
                      </p>
                    </div>
                  </div>

                  {/* Subtle Arrow Action Icon */}
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-gray-700/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                    <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No categories found.
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-6 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-600 dark:hover:text-white text-white font-bold rounded-xl transition-all duration-300 shadow-md shadow-slate-900/10 active:scale-98"
          >
            <span>View All Categories</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
