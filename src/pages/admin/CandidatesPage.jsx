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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Candidate Management
      </Typography>

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
