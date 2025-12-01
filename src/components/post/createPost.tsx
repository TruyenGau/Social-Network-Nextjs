"use client";
import {
  Box,
  Button,
  TextField,
  Avatar,
  IconButton,
  Paper,
  Typography,
  Stack,
} from "@mui/material";

import ImageIcon from "@mui/icons-material/Image";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventIcon from "@mui/icons-material/Event";
import DeleteIcon from "@mui/icons-material/Delete";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/next-auth";

interface IProps {
  data: IUser | null;
}
export default function PostForm(props: IProps) {
  const user = props.data;
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // CHỌN MEDIA
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files as FileList | null;
    if (!filesList) return;
    setFiles((prev) => [...prev, ...Array.from(filesList)]);
  };

  // XOÁ MEDIA
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // SUBMIT BÀI POST
  const handleSubmit = async () => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!content.trim() && files.length === 0)
      return alert("Vui lòng nhập nội dung hoặc ảnh!");

    setIsLoading(true);
    try {
      // UPLOAD ẢNH
      const formData = new FormData();
      files.forEach((file) => formData.append("media", file));

      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "multipart/form-data",
            folder_type: "post",
          },
        }
      );

      const uploadedImages = uploadRes.data?.data?.images || [];
      const uploadedVideos = uploadRes.data?.data?.videos || [];
      console.log("check upload", uploadedImages);
      // GỬI POST
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`,
        {
          content,
          images: uploadedImages,
          videos: uploadedVideos,
          userId: session?.user?._id,
          community: "test",
        },
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      // CLEAR FORM
      setContent("");
      setFiles([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo bài viết!");
    }
    setIsLoading(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        maxWidth: "600px", // giống post bên dưới
        margin: "0 auto", // căn giữa
        width: "100%",
      }}
    >
      <Box display="flex" gap={2}>
        <Avatar
          src={
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user?.avatar}` ||
            ""
          }
        />
        <TextField
          placeholder="Bạn đang nghĩ gì?"
          multiline
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            bgcolor: "#f7f7f7",
            borderRadius: "10px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: "0.9rem",
              padding: "10px",
            },
          }}
        />
      </Box>

      <Stack direction="row" justifyContent="space-between" mt={2}>
        <Stack direction="row" gap={1}>
          <Button
            startIcon={
              <img
                src="/icons/addimage.png" // Ảnh nằm trong thư mục public/icons/
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
            }
            component="label"
            sx={{ fontSize: "0.8rem", p: 0 }}
          >
            Photo
            <input
              hidden
              multiple
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </Button>

          <Button
            startIcon={
              <img
                src="/icons/addVideo.png"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
            }
            component="label"
            sx={{ fontSize: "0.8rem", p: 0 }}
          >
            Video
            <input
              hidden
              multiple
              type="file"
              accept="video/*"
              onChange={handleFileChange}
            />
          </Button>
        </Stack>

        <Button
          variant="contained"
          sx={{
            px: 2,
            py: 0.5,
            fontSize: "0.85rem",
            height: "36px",
            backgroundColor: "#4dce57ff",
            "&:hover": {
              backgroundColor: "#4dce57ff !important", // giữ nguyên 👈
            },
            borderRadius: "16px",
          }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng..." : "Đăng bài viết"}
        </Button>
      </Stack>

      {/* PREVIEW (ẢNH + VIDEO) */}
      {files.length > 0 && (
        <Box mt={2}>
          {files.map((file, i) => (
            <Box key={i} position="relative" mt={1}>
              {/* KIỂM TRA LOẠI FILE */}
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  style={{ width: "100%", borderRadius: 8 }}
                  alt="preview"
                />
              ) : file.type.startsWith("video/") ? (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <Typography color="error">
                  Không hỗ trợ loại file này!
                </Typography>
              )}

              {/* NÚT XOÁ */}
              <IconButton
                onClick={() => removeFile(i)}
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
        </Box>
      )}
    </Paper>
  );
}
