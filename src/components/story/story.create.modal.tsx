"use client";

import { Box, Button, IconButton, Typography, Paper } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useToast } from "@/utils/toast";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStoryModal({ onClose, onCreated }: Props) {
  const { data: session } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
  };

  const handleSubmit = async () => {
    if (!file) return alert("Bạn cần chọn ảnh!");

    setLoading(true);

    try {
      // Upload ảnh vào folder story
      const form = new FormData();
      form.append("media", file);

      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-media`,
        form,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "multipart/form-data",
            folder_type: "stories",
          },
        }
      );

      const fileName = uploadRes.data?.data?.images?.[0];

      if (!fileName) throw new Error("Upload thất bại!");

      // Gọi API tạo story
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stories`,
        { image: fileName },
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      toast.success("Tạo Story thành công");
      onCreated();
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi tạo Story");
    }

    setLoading(false);
  };

  return (
    <>
      {/* ================= Overlay ================= */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* ================= Modal ================= */}
      <Paper
        elevation={4}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: { xs: "95%", sm: 480 },
          borderRadius: "18px",
          p: 3,
          zIndex: 9999,
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            alignItems: "center",
          }}
        >
          <Typography fontSize={22} fontWeight={700}>
            Tạo Story
          </Typography>

          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: "#f3f3f3",
              "&:hover": { bgcolor: "#e5e5e5" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Nếu chưa chọn ảnh */}
        {!preview && (
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{
              py: 1.2,
              fontSize: 14,
              borderRadius: "14px",
              fontWeight: 600,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              background: "#6ecf68",

              boxShadow: "0 3px 10px rgba(74,144,226,0.3)",
              "&:hover": {
                background: "#6ecf68",
              },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 20 }} />
            Chọn ảnh
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleChooseFile}
            />
          </Button>
        )}

        {/* Khi đã chọn ảnh */}
        {preview && (
          <>
            <Box position="relative" mt={1}>
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${preview}`}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  maxHeight: 450,
                  objectFit: "cover",
                }}
              />

              {/* Nút remove ảnh */}
              <IconButton
                onClick={removeFile}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>

            {/* Nút đăng */}
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.8,
                borderRadius: "18px",
                fontWeight: 700,
                fontSize: 16,
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang đăng..." : "Đăng Story"}
            </Button>
          </>
        )}
      </Paper>
    </>
  );
}
