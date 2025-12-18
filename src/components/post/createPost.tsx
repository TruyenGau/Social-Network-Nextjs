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
import { useToast } from "@/utils/toast";

interface IProps {
  data: IUser | null;
}

export default function PostForm({ data }: IProps) {
  const user = data;
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 📌 Chọn MEDIA (ảnh hoặc video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    // gộp thêm vào files
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  // 📌 Xoá file trước khi upload
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // 📌 Submit (tạo post)
  const handleSubmit = async () => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!content.trim() && files.length === 0)
      return alert("Nhập nội dung hoặc chọn ảnh/video!");

    setIsLoading(true);

    try {
      let uploadedImages: string[] = [];
      let uploadedVideos: string[] = [];

      // 🟦 Có media → upload lên server
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("media", file);
        });

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

        const uploadData = uploadRes.data?.data;

        // ❌ MEDIA BỊ CHẶN
        if (uploadData?.success === false) {
          toast.error(uploadData.message || "Ảnh/video không hợp lệ");
          setIsLoading(false);
          return; // ⛔ DỪNG TẠI ĐÂY
        }

        uploadedImages = uploadRes.data?.data?.images || [];
        uploadedVideos = uploadRes.data?.data?.videos || [];
      }

      console.log("check image video", uploadedImages, uploadedVideos);
      // 🟩 Tạo POST
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`,
        {
          content,
          images: uploadedImages,
          videos: uploadedVideos,
          userId: session?.user?._id,
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
      // reset form
      setContent("");
      setFiles([]);
      router.refresh();
    } catch (err) {
      console.log(err);
      alert("Đăng bài lỗi!");
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
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <Box display="flex" gap={2}>
        <Avatar
          src={
            user?.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.avatar}`
              : ""
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
          {/* 🟦 CHỌN ẢNH */}
          <Button
            startIcon={
              <img
                src="/icons/addimage.png"
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
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {/* 🟥 CHỌN VIDEO */}
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
            backgroundColor: "#1877F2",
            borderRadius: "16px",
          }}
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Đang đăng..." : "Đăng bài viết"}
        </Button>
      </Stack>

      {/* PREVIEW MULTIPLE MEDIA */}
      {files.length > 0 && (
        <Box mt={2}>
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
