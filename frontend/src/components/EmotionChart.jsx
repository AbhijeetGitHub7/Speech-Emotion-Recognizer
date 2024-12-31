import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box, Typography } from "@mui/material";

const EmotionChart = ({ emotionData }) => {
  // Find the dominant emotion
  const getDominantEmotion = (emotionData) => {
    const maxEmotion = Object.keys(emotionData).reduce((max, key) => {
      return emotionData[key] > emotionData[max] ? key : max;
    });
    return maxEmotion;
  };

  // Get the emoji for the dominant emotion
  const emotionEmojis = {
    happy: "😊",
    sad: "😢",
    angry: "😡",
    neutral: "😐",
    disgust: "😠",
  };

  const dominantEmotion = getDominantEmotion(emotionData);
  const dominantEmoji = emotionEmojis[dominantEmotion];

  // Prepare chart data
  const chartData = Object.keys(emotionData).map((key) => ({
    name: key,
    value: emotionData[key],
  }));

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF9F40"];

  return (
    <Box sx={{ width: "100%", textAlign: "center", mt: 3 }}>
      <Typography variant="h6">Emotion Analysis</Typography>

      {/* Render PieChart */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
        <PieChart width={300} height={300}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Box>

      {/* Display the dominant emotion and its emoji */}
      {dominantEmotion && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5">
            Dominant Emotion: {dominantEmotion} {dominantEmoji}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default EmotionChart;
