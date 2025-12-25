"use client";

import { useEffect, useState } from "react";
import { Box, Avatar, Typography, LinearProgress } from "@mui/material";

interface StoryViewerProps {
  story: IStory;
  onClose: () => void;
}

export default function StoryViewer({ story, onClose }: StoryViewerProps) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onClose();
          return 100;
        }
        return prev + 1.5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onClose]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.92)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      {/* Thanh Progress */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 5,
            borderRadius: 5,
            backgroundColor: "rgba(255,255,255,0.25)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "white",
            },
          }}
        />
      </Box>

      {/* Avatar + Tên user */}
      <Box
        sx={{
          position: "absolute",
          top: 35,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "400px",
          width: "90%",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Avatar
          src={
            story.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${story.avatar}`
              : "/user/default-user.png"
          }
          sx={{ width: 36, height: 36, border: "2px solid white" }}
        />
        <Typography sx={{ color: "white", fontSize: 16, fontWeight: 600 }}>
          {story.userName}
        </Typography>
      </Box>

      {/* Ảnh Story */}
      <Box sx={{ width: "90%", maxWidth: "400px", textAlign: "center" }}>
        <img
          src={
            story.image
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${story.image}`
              : "/user/default-user.png"
          }
          alt="story"
          style={{
            width: "100%",
            maxHeight: "75vh",
            objectFit: "cover",
            borderRadius: 12,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}
