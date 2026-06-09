import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import {
  FiUpload,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { format } from "date-fns";

const DocumentSubmission = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState("");

  const documentTypes = [
    { key: "aadhar_front", label: "Aadhar Card (Front)", required: true },
    { key: "aadhar_back", label: "Aadhar Card (Back)", required: true },
    { key: "pan_card", label: "PAN Card", required: true },
    {
      key: "qualification_certificate",
      label: "Highest Qualification Certificate",
      required: true,
    },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/student-documents");
      setDocuments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

      setSelectedFile(file);
      setSelectedDocType(docType);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType) {
      toast.error("Please select a file and document type");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("documentType", selectedDocType);

    try {
      setUploading(true);
      await api.post("/student-documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      setSelectedDocType("");
      fetchDocuments();
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/student-documents/${id}`);
      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    }
  };

  const getDocumentByType = (docType) => {
    return documents.find((doc) => doc.documentType === docType);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiXCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const isAllDocumentsUploaded = () => {
    const requiredTypes = documentTypes
      .filter((dt) => dt.required)
      .map((dt) => dt.key);
    const uploadedTypes = documents.map((doc) => doc.documentType);
    return requiredTypes.every((type) => uploadedTypes.includes(type));
  };

  const isAllDocumentsApproved = () => {
    const requiredTypes = documentTypes
      .filter((dt) => dt.required)
      .map((dt) => dt.key);
    return requiredTypes.every((type) => {
      const doc = getDocumentByType(type);
      return doc && doc.status === "approved";
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Document Submission
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Upload your required documents for verification
          </p>
        </div>

        {/* Status Banner */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start sm:items-center">
            <FiAlertCircle className="text-blue-600 dark:text-blue-400 mr-3 text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Document Status
              </p>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                {isAllDocumentsApproved()
                  ? "All documents have been approved!"
                  : isAllDocumentsUploaded()
                    ? "All documents uploaded. Waiting for verification."
                    : "Please upload all required documents."}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {documentTypes.map((docType) => {
              const uploadedDoc = getDocumentByType(docType.key);
              return (
                <div
                  key={docType.key}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start">
                        <FiFileText className="text-indigo-600 dark:text-indigo-400 mr-3 text-xl flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {docType.label}
                            {docType.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h3>
                          {uploadedDoc ? (
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center min-w-0">
                                  <span className="font-medium mr-2">
                                    File:
                                  </span>
                                  <span className="truncate">
                                    {uploadedDoc.originalName}
                                  </span>
                                </div>
                                <span className="text-gray-400 sm:ml-2 mt-1 sm:mt-0 whitespace-nowrap">
                                  ({(uploadedDoc.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB)
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Status:</span>
                                <span className="ml-2">
                                  {getStatusBadge(uploadedDoc.status)}
                                </span>
                              </div>
                              {uploadedDoc.status === "rejected" &&
                                uploadedDoc.rejectionReason && (
                                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-300 break-words">
                                      <span className="font-medium">
                                        Rejection Reason:
                                      </span>{" "}
                                      {uploadedDoc.rejectionReason}
                                    </p>
                                  </div>
                                )}
                              {uploadedDoc.verifiedAt && (
                                <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">
                                    Verified At:
                                  </span>
                                  <span className="ml-2">
                                    {format(
                                      new Date(uploadedDoc.verifiedAt),
                                      "MMM dd, yyyy HH:mm",
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Not uploaded yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:ml-4 w-full sm:w-auto justify-start sm:justify-end">
                      {uploadedDoc ? (
                        <>
                          {uploadedDoc.status !== "approved" && (
                            <button
                              onClick={() => handleDelete(uploadedDoc._id)}
                              className="flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete document"
                            >
                              <FiTrash2 className="w-5 h-5 mr-2 sm:mr-0" />
                              <span className="sm:hidden text-sm font-medium">
                                Delete
                              </span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full sm:w-auto">
                          <input
                            type="file"
                            id={`file-${docType.key}`}
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => handleFileChange(e, docType.key)}
                          />
                          <label
                            htmlFor={`file-${docType.key}`}
                            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <FiUpload className="w-4 h-4 mr-2" />
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload button for selected file */}
                  {selectedFile && selectedDocType === docType.key && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center min-w-0">
                          <FiFileText className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap flex-shrink-0">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setSelectedDocType("");
                            }}
                            className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 sm:flex-none px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {uploading ? "Uploading..." : "Upload"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                Important Instructions
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Upload clear, readable copies of your documents</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Accepted file formats: JPEG, PNG, PDF</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Maximum file size: 5MB per document</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>
                    Documents will be verified by our team within 2-3 business
                    days
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>You can re-upload documents if they are rejected</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentSubmission;
