"use client";
import { Box, Modal, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useState } from "react";

const ImageViewer = ({ images, index, onClose }: any) => {
  const [current, setCurrent] = useState<number>(index);

  const next = () => {
    setCurrent((prev: number) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrent((prev: number) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Modal open onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "black",
          p: 2,
          borderRadius: 2,
          width: "90vw",
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* CLOSE BUTTON */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10, color: "white" }}
        >
          <CloseIcon />
        </IconButton>

        {/* PREV */}
        {images.length > 1 && (
          <IconButton
            onClick={prev}
            sx={{
              position: "absolute",
              left: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        {/* IMAGE */}
        <img
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${images[current]}`}
          style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }}
        />

        {/* NEXT */}
        {images.length > 1 && (
          <IconButton
            onClick={next}
            sx={{
              position: "absolute",
              right: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Modal>
  );
};

export default ImageViewer;
