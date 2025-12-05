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

import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/next-auth";

interface IProps {
  data: IUser | null;
  groupId: string | "";
  onPostCreated: () => void;
}

export default function CreatePost({ data, groupId, onPostCreated }: IProps) {
  const user = data;
  const { data: session } = useSession();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files as FileList | null;
    if (!filesList) return;
    setFiles((prev) => [...prev, ...Array.from(filesList)]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!content.trim() && files.length === 0)
      return alert("Vui lòng nhập nội dung hoặc ảnh!");

    setIsLoading(true);

    try {
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

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`,
        {
          content,
          images: uploadedImages,
          videos: uploadedVideos,
          userId: session?.user?._id,
          communityId: groupId,
        },
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      setContent("");
      setFiles([]);
      onPostCreated();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo bài viết!");
    }

    setIsLoading(false);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: "12px",
        maxWidth: "750px",
        width: "80%",
        mx: "auto",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* ==== ROW INPUT ==== */}
      <Box display="flex" gap={2} alignItems="center">
        <Avatar
          src={
            user?.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.avatar}`
              : "/user/default-user.png"
          }
          sx={{ width: 45, height: 45 }}
        />

        <Box
          sx={{
            flex: 1,
            background: "#f0f2f5",
            borderRadius: "25px",
            padding: "10px 18px",
            fontSize: "15px",
            color: "#555",
            border: "1px solid #ddd",
            cursor: "pointer",
            "&:hover": { background: "#e9eaec" },
          }}
        >
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

        <Button
          variant="contained"
          sx={{
            borderRadius: "20px",
            px: 3,
            textTransform: "none",
            fontWeight: 600,
            height: "38px",
          }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng..." : "Đăng bài viết"}
        </Button>
      </Box>

      {/* ==== ACTION BUTTONS ==== */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: 2,
          px: 1,
          alignItems: "center",
        }}
      >
        <Button
          startIcon={<img src="/icons/addimage.png" width={20} height={20} />}
          component="label"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#555",
            "&:hover": { background: "#f0f2f5" },
          }}
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
          startIcon={<img src="/icons/addVideo.png" width={20} height={20} />}
          component="label"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#555",
            "&:hover": { background: "#f0f2f5" },
          }}
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
      </Box>

      {/* ==== PREVIEW MEDIA ==== */}
      {files.length > 0 && (
        <Box mt={2}>
          {files.map((file, i) => (
            <Box key={i} position="relative" mt={1}>
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    maxHeight: 450,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  style={{ width: "100%", borderRadius: 8 }}
                />
              )}

              <IconButton
                onClick={() => removeFile(i)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(255,255,255,0.8)",
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
