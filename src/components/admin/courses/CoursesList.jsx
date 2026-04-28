import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaDownload,
  FaPaperPlane,
} from "react-icons/fa";
import {
  getCourses,
  deleteCourse,
  getCategoriesForForm,
} from "../../../api/courseApi";
import api from "../../../api/axios";
import SendCoursePdfModal from "./SendCoursePdfModal";

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showHomeFilter, setShowHomeFilter] = useState("all");
  const [generatingPdf, setGeneratingPdf] = useState(null);
  const [deletingPdf, setDeletingPdf] = useState(null);
  const [showSendPdfModal, setShowSendPdfModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [pdfUrls, setPdfUrls] = useState(() => {
    const saved = localStorage.getItem("pdfUrls");
    return saved ? JSON.parse(saved) : {};
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        showOnHome:
          showHomeFilter !== "all"
            ? showHomeFilter === "yes"
              ? "true"
              : "false"
            : undefined,
        all: "true",
      };

      // Clean undefined
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key],
      );

      const response = await getCourses(
        new URLSearchParams(params).toString(),
        true,
      );

      let data = Array.isArray(response) ? response : response?.data || [];
      if (!Array.isArray(data)) data = Object.values(data);

      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, showHomeFilter]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategoriesForForm();
      setCategories(data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    localStorage.setItem("pdfUrls", JSON.stringify(pdfUrls));
  }, [pdfUrls]);

  const handleGeneratePdf = async (course) => {
    try {
      setGeneratingPdf(course._id);
      const { data } = await api.post(`/courses/${course._id}/generate-pdf`);
      setPdfUrls((prev) => ({
        ...prev,
        [course._id]: { url: data.fileUrl, filename: data.filename },
      }));
      toast.success("PDF Generated");
    } catch (error) {
      toast.error("Generation failed");
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDeletePdf = async (course) => {
    if (!window.confirm("Delete this PDF?")) return;
    try {
      setDeletingPdf(course._id);
      await api.delete(`/courses/${course._id}/pdf`, {
        data: { fileUrl: pdfUrls[course._id]?.url },
      });
      setPdfUrls((prev) => {
        const next = { ...prev };
        delete next[course._id];
        return next;
      });
      toast.success("PDF Deleted");
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeletingPdf(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header - More Compact */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Courses</h1>
          <p className="text-xs text-gray-500">
            Manage your course catalog and PDFs.
          </p>
        </div>
        <Link
          to="new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition shadow-sm"
        >
          + Add Course
        </Link>
      </div>

      {/* Tighter Filter Bar */}
      <div className="bg-white p-3 rounded shadow-sm border border-gray-100 flex flex-wrap gap-3 items-end mb-4">
        <div className="w-full md:w-48">
          <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
            Search
          </label>
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-40">
          <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
            Category
          </label>
          <select
            className="w-full py-1.5 text-sm border border-gray-200 rounded outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-32">
          <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
            Visibility
          </label>
          <select
            className="w-full py-1.5 text-sm border border-gray-200 rounded outline-none"
            value={showHomeFilter}
            onChange={(e) => setShowHomeFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">On Home</option>
            <option value="no">Hidden</option>
          </select>
        </div>
      </div>

      {/* Table - High Density */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-[11px] font-bold text-gray-500 uppercase">
                Course
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase">
                Category
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase">
                Price
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-8 text-center text-sm text-gray-400"
                >
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* <img
                        className="h-8 w-8 rounded object-cover border border-gray-100"
                        src={course.thumbnail}
                        alt=""
                      /> */}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 leading-tight">
                          {course.title}
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase">
                          {course.level}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">
                    {course.category?.name || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-gray-700">
                    ₹{course.price?.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        course.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {course.isPublished ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        to={`/admin/courses/${course._id}/edit`}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowSendPdfModal(true);
                        }}
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded"
                        title="Send PDF"
                      >
                        <FaPaperPlane size={14} />
                      </button>

                      {pdfUrls[course._id] ? (
                        <>
                          <a
                            href={pdfUrls[course._id].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded"
                            title="Download PDF"
                          >
                            <FaDownload size={14} />
                          </a>
                          <button
                            onClick={() => handleDeletePdf(course)}
                            disabled={deletingPdf === course._id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            {deletingPdf === course._id ? (
                              <div className="h-3 w-3 animate-spin border-2 border-red-500 border-t-transparent rounded-full" />
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGeneratePdf(course)}
                          disabled={generatingPdf === course._id}
                          className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"
                          title="Generate PDF"
                        >
                          {generatingPdf === course._id ? (
                            <div className="h-3 w-3 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full" />
                          ) : (
                            <FaFilePdf size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedCourse && (
        <SendCoursePdfModal
          course={selectedCourse}
          isOpen={showSendPdfModal}
          onClose={() => {
            setShowSendPdfModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={fetchCourses}
        />
      )}
    </div>
  );
};

export default CoursesList;
