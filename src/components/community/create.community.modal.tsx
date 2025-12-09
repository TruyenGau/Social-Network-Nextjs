"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import GroupIcon from "@mui/icons-material/Group";
import ImageIcon from "@mui/icons-material/Image";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ open, onClose }: IProps) {
  const { data: session } = useSession();
  const route = useRouter();
  const toast = useToast();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  /** UPLOAD PREVIEW */
  const handlePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /** UPLOAD MEDIA → TRẢ VỀ TÊN FILE */
  const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append("media", file);

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "multipart/form-data",
          folder_type: "group",
        },
      }
    );

    return res.data?.data?.images?.[0] || null;
  };

  /** SUBMIT */
  const handleSubmit = async () => {
    if (!session) return alert("Bạn cần đăng nhập!");
    if (!groupName.trim()) return alert("Tên nhóm không được bỏ trống!");

    let avatarName = "";
    let coverName = "";

    try {
      // UPLOAD AVATAR
      if (avatarFile) {
        const uploaded = await uploadMedia(avatarFile);
        avatarName = uploaded;
      }

      // UPLOAD COVER
      if (coverFile) {
        const uploaded = await uploadMedia(coverFile);
        coverName = uploaded;
      }

      // CREATE COMMUNITY
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities`,
        {
          name: groupName,
          description: description,
          avatar: avatarName,
          coverPhoto: coverName,
        },
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );

      const newGroup = res.data?.data;

      onClose();
      setGroupName("");
      setDescription("");

      // if (newGroup?._id) router.push(`/community/${newGroup._id}`);
      await sendRequest<IBackendRes<any>>({
        url: "/api/revalidate",
        method: "POST",
        queryParams: {
          tag: "fetch-groups",
          secret: "levantruyen",
        },
      });
      route.refresh();
      toast.success("Tạo nhóm thành công");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo nhóm!");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* HEADER */}
      <Box
        sx={{
          position: "relative",
          background: "linear-gradient(to bottom right, #dbeafe, #eff6ff)",
          height: 140,
        }}
      >
        {/* COVER */}
        {coverPreview ? (
          <img
            src={coverPreview}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            onClick={() => coverRef.current?.click()}
            sx={{
              width: "100%",
              height: "100%",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              color: "gray",
            }}
          >
            <ImageIcon sx={{ fontSize: 28 }} />
            <Typography>Thêm ảnh bìa</Typography>
          </Box>
        )}

        <IconButton
          sx={{ position: "absolute", top: 10, right: 10, bgcolor: "white" }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        <input
          ref={coverRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => handlePreview(e, setCoverFile, setCoverPreview)}
        />

        {/* AVATAR */}
        <Box sx={{ position: "absolute", left: 32, bottom: -45 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={avatarPreview || ""}
              sx={{
                width: 90,
                height: 90,
                bgcolor: "#e5e7eb",
                border: "4px solid white",
              }}
            >
              {!avatarPreview && <GroupIcon sx={{ fontSize: 40 }} />}
            </Avatar>

            <IconButton
              onClick={() => avatarRef.current?.click()}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "#1976d2",
                color: "white",
                width: 32,
                height: 32,
              }}
            >
              <CameraAltIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <input
              ref={avatarRef}
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                handlePreview(e, setAvatarFile, setAvatarPreview)
              }
            />
          </Box>
        </Box>
      </Box>

      {/* CONTENT */}
      <DialogContent sx={{ mt: 6 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          ✨ Tạo nhóm mới
        </Typography>

        <TextField
          fullWidth
          label="Tên nhóm *"
          required
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
        />
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="contained"
          fullWidth
          disabled={!groupName.trim()}
          onClick={handleSubmit}
        >
          Tạo nhóm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
