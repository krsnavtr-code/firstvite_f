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
      const response = await api.get(`/admin/candidates?page=${page}&limit=10`);
      setCandidates(response.data.data.candidates);
      setTotalPages(Math.ceil(response.data.total / 10));
    } catch (error) {
      console.error("Error fetching candidates:", error);
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
    try {
      await api.patch(`/admin/candidates/${selectedCandidate._id}/status`, {
        status,
        notes,
      });
      fetchCandidates();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating candidate status:", error);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get("/admin/candidates?limit=1000");
      const allCandidates = response.data.data.candidates;

      const headers = [
        "Registration ID",
        "Name",
        "Email",
        "Phone",
        "Course",
        "College",
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
          `"${c.course || ""}"`,
          `"${c.college || ""}"`,
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
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Candidate Management</h2>
        <button
          onClick={exportToCSV}
          disabled={loading}
          style={{
            padding: "8px 14px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ⬇ Export to CSV
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>Name</th>
            <th>Registration ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Course</th>
            <th>College</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : candidates.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
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
                <td>{c.course}</td>
                <td>{c.college}</td>
                <td>
                  <span
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
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #1976d2",
                      color: "#1976d2",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
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
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              style={{
                margin: "0 4px",
                padding: "6px 10px",
                backgroundColor: num === page ? "#1976d2" : "#f2f2f2",
                color: num === page ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
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
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "6px",
              width: "400px",
            }}
          >
            <h3>Update Candidate Status</h3>
            {selectedCandidate && (
              <>
                <p>
                  <strong>Name:</strong> {selectedCandidate.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedCandidate.email}
                </p>
                <div style={{ marginBottom: "10px" }}>
                  <label>Status:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: "100%", padding: "6px", marginTop: "5px" }}
                  >
                    {["pending", "reviewed", "contacted", "rejected"].map(
                      (option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label>Notes:</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    style={{ width: "100%", padding: "6px" }}
                  />
                </div>
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: "#ccc",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
