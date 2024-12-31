import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Fade,
  Grow,
} from "@mui/material";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EmotionChart from "./EmotionChart";
import MicRecorder from "mic-recorder-to-mp3";
import axios from "axios";
import "../App.css"; // Ensure your CSS is imported

const recorder = new MicRecorder({ bitRate: 128 });

function AudioInput() {
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [emotionData, setEmotionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const startRecording = () => {
    recorder
      .start()
      .then(() => setRecording(true))
      .catch((err) => {
        console.error("Error starting recorder:", err);
        setSnackbarMessage("Unable to start recording.");
        setOpenSnackbar(true);
      });
  };

  const stopRecording = () => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "recording.mp3", { type: "audio/mp3" });
        setRecordedBlob(file);
        setAudioUrl(URL.createObjectURL(blob));
        setRecording(false);
        setEmotionData(null); // Reset previous result
      })
      .catch((err) => {
        console.error("Error stopping recorder:", err);
        setSnackbarMessage("Unable to stop recording.");
        setOpenSnackbar(true);
      });
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setEmotionData(null);
      setRecordedBlob(null); // Reset the recorded audio if a file is uploaded
    }
  };

  const handleAudioSubmit = async () => {
    const fileToSubmit = recordedBlob || audioFile;

    if (!fileToSubmit) {
      setSnackbarMessage("Please select or record an audio file first.");
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", fileToSubmit);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setEmotionData(response.data);
      setSubmitted(true); // Hide the form and display the chart
      setSnackbarMessage("Emotion detected successfully!");
    } catch (error) {
      console.error("Error uploading audio:", error);
      setSnackbarMessage("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box className="audio-input-container"> {/* Added custom class */}
      {!submitted ? (
        <Grow in={!submitted} timeout={600}>
          <Box className="form-container" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}> {/* Custom class for form */}
            <Typography variant="h5" className="form-header">
              Record or Upload Audio to Detect Emotion
            </Typography>

            <Button
              variant="contained"
              component="label"
              className="upload-button"
              startIcon={<UploadFileIcon />}
              sx={{ mb: 2 }} // Space between buttons
            >
              Choose File
              <input type="file" accept="audio/*" hidden onChange={handleAudioUpload} />
            </Button>

            {!recording ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<MicIcon />}
                onClick={startRecording}
                className="record-button"
                sx={{ mb: 2 }} // Space between buttons
              >
                Start Recording
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<StopIcon />}
                onClick={stopRecording}
                className="stop-button"
                sx={{ mb: 2 }} // Space between buttons
              >
                Stop Recording
              </Button>
            )}

            {audioUrl && (
              <Box className="audio-preview">
                <Typography variant="body2">Preview:</Typography>
                <audio controls src={audioUrl} />
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleAudioSubmit}
              className="submit-button"
              startIcon={<AudiotrackIcon />}
              sx={{ mb: 2 }} // Space between buttons
            >
              Results
            </Button>

            {loading && (
              <Fade in={loading}>
                <CircularProgress className="loading-spinner" />
              </Fade>
            )}
          </Box>
        </Grow>
      ) : (
        <Fade in={submitted}>
          <Box className="result-container">
            <Typography variant="h5" className="result-header">
              Detected Emotion
            </Typography>
            {emotionData && <EmotionChart emotionData={emotionData} />}
          </Box>
        </Fade>
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="info" className="snackbar">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AudioInput;
