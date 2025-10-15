import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { saveAs } from "file-saver";
import { format } from "date-fns";

const statusColors = {
  pending: "gray",
  reviewed: "blue",
  contacted: "orange",
  rejected: "red",
};

const CandidatesPage = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/candidates?page=${page}&limit=10`);
      const responseData = response.data;

      // Check if the response data is in the expected format
      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        setCandidates(responseData.data);
        setTotalPages(Math.ceil(responseData.total / 10) || 1);
      } else {
        console.error("Unexpected API response format:", responseData);
        setCandidates([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const handleOpenModal = (candidate) => {
    setSelectedCandidate(candidate);
    setStatus(candidate.status);
    setNotes(candidate.notes || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
    setStatus("");
    setNotes("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedCandidate) return;

    try {
      await api.patch(`/candidates/${selectedCandidate._id}/status`, {
        status,
        notes,
      });
      fetchCandidates();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating candidate status:", error);
      alert("Failed to update candidate status. Please try again.");
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get("/candidates?limit=1000");
      const responseData = response.data;
      const allCandidates = Array.isArray(responseData.data)
        ? responseData.data
        : [];

      const headers = [
        "Registration ID",
        "Name",
        "Email",
        "Phone",
        "User Type",
        "Course",
        "College",
        "University",
        "Company Name",
        "Status",
        "Notes",
        "Created At",
      ];

      const csvRows = allCandidates.map((c) => {
        return [
          `"${c.registrationId || ""}"`,
          `"${c.name || ""}"`,
          `"${c.email || ""}"`,
          `"${c.phone || ""}"`,
          `"${c.userType || ""}"`,
          `"${c.course || ""}"`,
          `"${c.college || ""}"`,
          `"${c.university || ""}"`,
          `"${c.companyName || ""}"`,
          `"${c.status || ""}"`,
          `"${(c.notes || "").replace(/"/g, '""')}"`,
          `"${
            c.createdAt ? format(new Date(c.createdAt), "yyyy-MM-dd HH:mm") : ""
          }"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, `candidates_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export candidates. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2>Candidate Management</h2>
        <button
          onClick={exportToCSV}
          disabled={loading}
          className="btn btn-primary"
        >
          ⬇ Export to CSV
        </button>
      </div>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Registration ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Course</th>
            <th>College/Company</th>
            <th>University</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center">
                Loading...
              </td>
            </tr>
          ) : candidates.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No candidates found
              </td>
            </tr>
          ) : (
            candidates.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.registrationId}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.userType === "student" ? "Student" : "Company"}</td>
                <td>{c.course || "-"}</td>
                <td>{c.userType === "student" ? c.college : c.companyName}</td>
                <td>{c.university || "-"}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: statusColors[c.status] || "gray",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleOpenModal(c)}
                    className="btn btn-primary"
                  >
                    View/Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className="btn btn-outline-primary"
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCandidate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
            }}
          >
            <h3>Candidate Details</h3>
            <div style={{ marginBottom: "15px" }}>
              <p>
                <strong>Name:</strong> {selectedCandidate.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedCandidate.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCandidate.phone}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {selectedCandidate.userType === "student"
                  ? "Student"
                  : "Company"}
              </p>

              {selectedCandidate.userType === "student" ? (
                <>
                  <p>
                    <strong>Course:</strong> {selectedCandidate.course || "-"}
                  </p>
                  <p>
                    <strong>College:</strong> {selectedCandidate.college || "-"}
                  </p>
                  <p>
                    <strong>University:</strong>{" "}
                    {selectedCandidate.university || "-"}
                  </p>
                </>
              ) : (
                <p>
                  <strong>Company Name:</strong>{" "}
                  {selectedCandidate.companyName || "-"}
                </p>
              )}

              <div style={{ marginTop: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  <strong>Status:</strong>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  <strong>Notes:</strong>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", minHeight: "100px", padding: "8px" }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
