import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Pagination,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

const statusColors = {
  pending: "default",
  reviewed: "primary",
  contacted: "info",
  rejected: "error",
};

const CandidatesPage = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/admin/candidates?page=${page}&limit=10`
      );
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

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleOpenDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setStatus(candidate.status);
    setNotes(candidate.notes || "");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating candidate status:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const exportToCSV = async () => {
    try {
      // Fetch all candidates without pagination
      const response = await api.get('/admin/candidates?limit=1000');
      const allCandidates = response.data.data.candidates;
      
      // Define CSV headers
      const headers = [
        'Registration ID',
        'Name',
        'Email',
        'Phone',
        'Course',
        'College',
        'Status',
        'Notes',
        'Created At'
      ];

      // Convert data to CSV rows
      const csvRows = allCandidates.map(candidate => {
        return [
          `"${candidate.registrationId || ''}"`,
          `"${candidate.name || ''}"`,
          `"${candidate.email || ''}"`,
          `"${candidate.phone || ''}"`,
          `"${candidate.course || ''}"`,
          `"${candidate.college || ''}"`,
          `"${candidate.status || ''}"`,
          `"${(candidate.notes || '').replace(/"/g, '""')}"`,
          `"${candidate.createdAt ? format(new Date(candidate.createdAt), 'yyyy-MM-dd HH:mm') : ''}"`
        ].join(',');
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows
      ].join('\n');

      // Create blob and trigger download
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `candidates_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export candidates. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Candidate Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={exportToCSV}
          disabled={loading}
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
          }
        >
          Export to CSV
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Registration ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>College</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.registrationId}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone}</TableCell>
                  <TableCell>{candidate.course}</TableCell>
                  <TableCell>{candidate.college}</TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.status}
                      color={statusColors[candidate.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog(candidate)}
                    >
                      View/Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Candidate Status</DialogTitle>
        <DialogContent>
          {selectedCandidate && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Name"
                value={selectedCandidate.name}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="Email"
                value={selectedCandidate.email}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                select
                label="Status"
                value={status}
                onChange={handleStatusChange}
                fullWidth
                margin="normal"
              >
                {["pending", "reviewed", "contacted", "rejected"].map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  )
                )}
              </TextField>
              <TextField
                label="Notes"
                value={notes}
                onChange={handleNotesChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                placeholder="Add any notes about this candidate..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidatesPage;
