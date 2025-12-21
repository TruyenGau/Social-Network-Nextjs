"use client";

import { useState, useRef, useEffect } from "react";
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
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

interface IProps {
  open: boolean;
  onClose: () => void;
  group: IGroups;
  onUpdated: () => void;
}

export default function UpdateGroupModal({
  open,
  onClose,
  group,
  onUpdated,
}: IProps) {
  const { data: session } = useSession();
  const toast = useToast();

  /* ================= STATE ================= */
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  /* ================= INIT DATA ================= */
  useEffect(() => {
    if (!group) return;

    setGroupName(group.name);
    setDescription(group.description || "");
    setVisibility(group.visibility);

    setAvatarPreview(group.avatar ? group.avatar : null);

    setCoverPreview(group.coverPhoto ? group.coverPhoto : null);
  }, [group, open]);

  /* ================= PREVIEW ================= */
  const handlePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPLOAD ================= */
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

    return res.data?.data?.images?.[0] || "";
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!session) return;

    try {
      let avatar = group.avatar;
      let coverPhoto = group.coverPhoto;

      if (avatarFile) avatar = await uploadMedia(avatarFile);
      if (coverFile) coverPhoto = await uploadMedia(coverFile);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${group._id}`,
        {
          name: groupName,
          description,
          visibility,
          avatar,
          coverPhoto,
        },
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      toast.success("Cập nhật nhóm thành công");
      onClose();
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật nhóm thất bại");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* HEADER */}
      <Box sx={{ height: 140, position: "relative" }}>
        {coverPreview ? (
          <img
            src={coverPreview}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            onClick={() => coverRef.current?.click()}
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "gray",
              cursor: "pointer",
            }}
          >
            <ImageIcon />
            <Typography ml={1}>Cập nhật ảnh bìa</Typography>
          </Box>
        )}

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
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
        <Box sx={{ position: "absolute", left: 24, bottom: -40 }}>
          <Box position="relative">
            <Avatar src={avatarPreview || ""} sx={{ width: 90, height: 90 }}>
              {!avatarPreview && <GroupIcon />}
            </Avatar>

            <IconButton
              onClick={() => avatarRef.current?.click()}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <CameraAltIcon fontSize="small" />
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

      <DialogContent sx={{ mt: 6 }}>
        <Typography fontWeight={700} mb={2}>
          ✏️ Cập nhật thông tin nhóm
        </Typography>

        <TextField
          fullWidth
          label="Tên nhóm"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth>
          <InputLabel>Quyền riêng tư</InputLabel>
          <Select
            value={visibility}
            label="Quyền riêng tư"
            onChange={(e) =>
              setVisibility(e.target.value as "PUBLIC" | "PRIVATE")
            }
          >
            <MenuItem value="PUBLIC">🌍 Công khai</MenuItem>
            <MenuItem value="PRIVATE">🔒 Riêng tư</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={!groupName.trim()}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
