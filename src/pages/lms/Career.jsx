import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Career = () => {
  const [loading, setLoading] = useState(true);
  const [jobListings, setJobListings] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available"); // 'available' or 'applied'
  const [filters, setFilters] = useState({
    jobType: "",
    course: "",
  });
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appliedRes, coursesRes] = await Promise.all([
          axios.get("/api/careers?status=Open"),
          user
            ? axios.get(`/api/users/${user.id}/applications`)
            : Promise.resolve({ data: [] }),
          axios.get("/api/courses"),
        ]);

        setJobListings(jobsRes.data);
        setFilteredJobs(jobsRes.data);
        setAppliedJobs(appliedRes.data || []);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    let result = [...jobListings];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term),
      );
    }
    if (filters.jobType)
      result = result.filter((job) => job.jobType === filters.jobType);
    if (filters.course)
      result = result.filter((job) => job.courseId?._id === filters.course);
    setFilteredJobs(result);
  }, [searchTerm, filters, jobListings]);

  const handleApply = async (jobId) => {
    if (!user) return alert("Please login to apply");
    try {
      await axios.post("/api/applications", { jobId, studentId: user.id });
      const job = jobListings.find((j) => j._id === jobId);
      setAppliedJobs([
        ...appliedJobs,
        { ...job, status: "applied", appliedAt: new Date() },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const isApplied = (jobId) =>
    appliedJobs.some((job) => job._id === jobId || job.jobId === jobId);

  return (
    <div className="max-w-7xl mx-auto min-h-screen transition-colors">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-blue-600 rounded-xl">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            Career Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Explore roles that match your skills and growth.
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <input
            type="text"
            placeholder="Search roles, skills..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="w-5 h-5 absolute left-4 top-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "available" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          Available Jobs
        </button>
        <button
          onClick={() => setActiveTab("applied")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "applied" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          My Applications ({appliedJobs.length})
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl"
            ></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "available" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">
                          {job.location} • {job.jobType}
                        </p>
                      </div>
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {job.salary || "Competitive"}
                      </span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.requirements.slice(0, 3).map((req, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-100 dark:border-slate-700"
                        >
                          {req}
                        </span>
                      ))}
                    </div>

                    <button
                      disabled={isApplied(job._id)}
                      onClick={() => handleApply(job._id)}
                      className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${isApplied(job._id) ? "bg-emerald-50 text-emerald-600 cursor-default" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"}`}
                    >
                      {isApplied(job._id)
                        ? "✓ Application Sent"
                        : "Apply for this Role"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-slate-400">
                  No jobs match your current search.
                </div>
              )}
            </div>
          ) : (
            /* Applied Jobs Tab Content */
            <div className="space-y-4">
              {appliedJobs.length > 0 ? (
                appliedJobs.map((app) => {
                  const job = app.jobId || app;
                  return (
                    <div
                      key={app._id}
                      className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-bold">
                          {job.title?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {job.title}
                          </h4>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">
                            Applied{" "}
                            {formatDistanceToNow(
                              new Date(app.appliedAt || new Date()),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden lg:block">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                            Status
                          </p>
                          <span
                            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${app.status === "hired" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {app.status || "Under Review"}
                          </span>
                        </div>
                        <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-slate-400">
                  You haven't submitted any applications yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Career;
