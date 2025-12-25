"use client";
import {
  Box,
  Button,
  TextField,
  Avatar,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/next-auth";
import { useToast } from "@/utils/toast";

interface IProps {
  user: IUser | null;
  groupId: string;
  onPostCreated: () => void;
  isJoined: boolean;
}

export default function CreatePostGroup({
  user,
  groupId,
  onPostCreated,
  isJoined,
}: IProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!content.trim() && files.length === 0)
      return alert("Vui lòng nhập nội dung hoặc chọn media!");

    setIsLoading(true);

    try {
      let uploadedImages: string[] = [];
      let uploadedVideos: string[] = [];

      // 🟦 Upload media nếu có
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("media", file));

        const uploadRes = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-media`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
              "Content-Type": "multipart/form-data",
              folder_type: "posts",
            },
          }
        );

        const uploadData = uploadRes.data?.data;

        // ❌ MEDIA BỊ CHẶN
        if (uploadData?.success === false) {
          toast.error(uploadData.message || "Ảnh/video không hợp lệ");
          setIsLoading(false);
          return;
        }

        uploadedImages = uploadRes.data?.data?.images || [];
        uploadedVideos = uploadRes.data?.data?.videos || [];
      }

      // 🟩 Tạo bài viết GROUP
      const res = await axios.post(
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
      if (res.data.data.success === true) {
        toast.success("Tạo bài viết thành công");
      }
      if (res.data.data.success === false) {
        toast.error(res.data.data.message);
      }
      // Reset form
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
        width: "100%",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* INPUT */}
      <Box display="flex" gap={2} alignItems="flex-start">
        <Avatar
          src={
            user?.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.avatar}`
              : "/user/default-user.png"
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

      {/* ACTION BUTTONS */}
      <Stack direction="row" justifyContent="space-between" mt={2}>
        <Stack direction="row" gap={2}>
          {/* 🖼 Chọn ảnh */}
          <Button
            startIcon={<img src="/icons/addimage.png" width={20} height={20} />}
            component="label"
            sx={{ textTransform: "none", fontSize: "0.85rem", color: "#555" }}
          >
            Ảnh
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {/* 🎥 Chọn video */}
          <Button
            startIcon={<img src="/icons/addVideo.png" width={20} height={20} />}
            component="label"
            sx={{ textTransform: "none", fontSize: "0.85rem", color: "#555" }}
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

        {isJoined ? (
          <Button
            variant="contained"
            sx={{
              px: 3,
              borderRadius: "20px",
              fontWeight: 600,
              textTransform: "none",
            }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng..." : "Đăng bài viết"}
          </Button>
        ) : (
          <></>
        )}
      </Stack>

      {/* PREVIEW MEDIA */}
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
