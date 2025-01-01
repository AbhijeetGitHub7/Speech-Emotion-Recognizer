import React from "react";
import AudioInput from "../components/AudioInput";
import { AppBar, Toolbar, Typography, Container, Button, Box } from "@mui/material";
import '../App.css';

const HomePage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width:"100%",backgroundColor: "#f5f5f5"}}>
      {/* Material UI Navbar */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            WaveEmote
          </Typography>
          <Button color="inherit">About</Button>
          <Button color="inherit">Contact</Button>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container sx={{ paddingTop: 5, maxWidth: "lg", flexGrow: 1 }}>
        <AudioInput />
      </Container>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          mt: 5,
          backgroundColor: "#3f51b5",
          color: "white",
          textAlign: "center",
          width: "100%",
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} WaveEmote. All rights reserved.
        </Typography>
      </Box>
    </div>
  );
};

export default HomePage;
