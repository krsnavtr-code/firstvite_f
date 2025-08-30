import React from "react";
import { Link } from "react-router-dom";

const Card = ({ to, title, desc, icon, color = "indigo" }) => (
  <Link
    to={to}
    className={`group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-${color}-500/40`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`rounded-lg p-2.5 text-${color}-600 bg-${color}-50 ring-1 ring-${color}-100 group-hover:bg-${color}-100 transition`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {desc && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{desc}</p>
        )}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-600">
      <span className="transition group-hover:text-gray-900">Open</span>
      <svg
        className="h-4 w-4 transition group-hover:translate-x-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </Link>
);

const Icon = {
  Flag: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 3a1 1 0 011-1h10.382a1 1 0 01.894.553l.724 1.447H21a1 1 0 01.894 1.447l-2 4A1 1 0 0119 10h-3.382l-.724-1.447A1 1 0 0014 8H6v13a1 1 0 11-2 0V3z" />
    </svg>
  ),
  Course: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 5a2 2 0 012-2h9a2 2 0 012 2v1h2a2 2 0 012 2v11a1 1 0 01-1.447.894L16 18.118l-3.553 1.776A1 1 0 0111 19V6H5a2 2 0 01-2-2z" />
    </svg>
  ),
  Users: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0v1H5v-1zM17 11a4 4 0 110-8 4 4 0 010 8zM3 22a6 6 0 0112 0H3z" />
    </svg>
  ),
  Media: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H9l-5 3V5z" />
    </svg>
  ),
  Check: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Arrow: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" />
    </svg>
  ),
};

const LmsManagement = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            LMS Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Configure sprints and manage learning content for your courses. Use
            the quick links below to jump into common admin tasks.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/lms/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-black"
            title="Preview the LMS as a learner"
          >
            Preview LMS
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* LMS Administration */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700">Administration</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            to="/admin/lms/create-sprint"
            title="Sprint Management"
            desc="Create and manage sprints, sessions, and tasks for each course."
            icon={Icon.Flag}
            color="indigo"
          />
          <Card
            to="/admin/lms/assessment"
            title="Assessment Management"
            desc="View, create, and edit assessment connected to the LMS."
            icon={Icon.Course}
            color="emerald"
          />
          {/* Career  */}
          <Card
            to="/admin/lms/career"
            title="Career Management"
            desc="Manage career opportunities and job listings for your courses."
            icon={Icon.Users}
            color="blue"
          />
        </div>
      </section>
    </div>
  );
};

export default LmsManagement;
