"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Avatar,
  Typography,
  Stack,
  Paper,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

interface Props {
  postId: string;
  open: boolean;
  onClose: () => void;
  session: any;
  onUpdated: () => void;
}

export default function UpdatePostModal({
  postId,
  open,
  onClose,
  session,
  onUpdated,
}: Props) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD POST ================= */
  useEffect(() => {
    if (!open) return;

    const fetchPost = async () => {
      const res = await sendRequest<IBackendRes<any>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res?.data) {
        setContent(res.data.content || "");
        setExistingImages(res.data.images || []);
        setExistingVideos(res.data.videos || []);
      }
    };

    fetchPost();
  }, [open, postId]);

  /* ================= FILE HANDLER ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeNewFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index: number) => {
    setExistingVideos(existingVideos.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error("Nội dung hoặc media không được trống");
      return;
    }

    setLoading(true);

    try {
      let newImages: string[] = [];
      let newVideos: string[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("media", file));

        const uploadRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-media`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "multipart/form-data",
              folder_type: "post",
            },
          }
        );

        newImages = uploadRes.data?.data?.images || [];
        newVideos = uploadRes.data?.data?.videos || [];
      }

      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${postId}`,
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          content,
          images: [...existingImages, ...newImages],
          videos: [...existingVideos, ...newVideos],
        },
      });

      toast.success("Cập nhật bài viết thành công");
      onClose();
      onUpdated();
    } catch (err) {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* ===== HEADER ===== */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        Chỉnh sửa bài viết
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* ===== CONTENT ===== */}
      <DialogContent>
        <Box display="flex" gap={2} mb={2}>
          <Avatar
            src={
              session?.user?.avatar
                ? session.user.avatar
                : "/user/default-user.png"
            }
          />
          <TextField
            multiline
            fullWidth
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Box>

        {/* ===== EXISTING MEDIA ===== */}
        <Stack gap={1}>
          {existingImages.map((img, i) => (
            <Box key={i} position="relative">
              <img src={img} style={{ width: "100%", borderRadius: 8 }} />
              <IconButton
                onClick={() => removeExistingImage(i)}
                sx={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  bgcolor: "white",
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}

          {existingVideos.map((vid, i) => (
            <Box key={i} position="relative">
              <video
                controls
                src={vid}
                style={{ width: "100%", borderRadius: 8 }}
              />
              <IconButton
                onClick={() => removeExistingVideo(i)}
                sx={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  bgcolor: "white",
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}
        </Stack>

        {/* ===== NEW MEDIA PREVIEW ===== */}
        {files.map((file, i) => (
          <Box key={i} position="relative" mt={1}>
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                style={{ width: "100%", borderRadius: 8 }}
              />
            ) : (
              <video
                src={URL.createObjectURL(file)}
                controls
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}

            <IconButton
              onClick={() => removeNewFile(i)}
              sx={{ position: "absolute", top: 5, right: 5, bgcolor: "white" }}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Box>
        ))}

        {/* ===== MEDIA BUTTONS ===== */}
        <Stack direction="row" gap={2} mt={2}>
          <Button
            component="label"
            startIcon={<img src="/icons/addimage.png" width={20} />}
          >
            Ảnh
            <input
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </Button>

          <Button
            component="label"
            startIcon={<img src="/icons/addVideo.png" width={20} />}
          >
            Video
            <input
              hidden
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
            />
          </Button>
        </Stack>
      </DialogContent>

      {/* ===== ACTIONS ===== */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 0 },
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button onClick={onClose} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
