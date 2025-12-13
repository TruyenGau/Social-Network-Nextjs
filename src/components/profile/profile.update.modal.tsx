"use client";

import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useToast } from "@/utils/toast";

interface IProps {
  open: boolean;
  onClose: () => void;
  user: IUser;
  token: string;
  route: any;
}

export default function ProfileUpdateModal({
  open,
  onClose,
  user,
  token,
  route,
}: IProps) {
  const [form, setForm] = useState({
    name: user.name || "",
    age: user.age || "",
    school: user.school || "",
    description: user.description || "",
    work: user.work || "",
    address: user.address || "",
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "",
    birthday: user.birthday ? user.birthday.substring(0, 10) : "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  // Upload ảnh
  const uploadImage = async (file: File, folderType: string) => {
    const formData = new FormData();
    formData.append("media", file);

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/files/upload-media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          folder_type: folderType,
        },
      }
    );

    return res.data?.data?.images?.[0] || "";
  };

  // Submit cập nhật user
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      let avatarUrl = user.avatar;
      let coverUrl = user.coverPhoto;

      if (avatarFile) avatarUrl = await uploadImage(avatarFile, "avatar");
      if (coverFile) coverUrl = await uploadImage(coverFile, "avatar");

      await sendRequest<IBackendRes<IUser>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          email: user.email,
          _id: user._id,
          role: user.role,
          ...form,
          avatar: avatarUrl,
          coverPhoto: coverUrl,
          birthday: form.birthday ? new Date(form.birthday) : null,
        },
      });

      // Revalidate cache
      await sendRequest<IBackendRes<any>>({
        url: "/api/revalidate",
        method: "POST",
        queryParams: {
          tag: "fetch-profile-info",
          secret: "levantruyen",
        },
      });

      route.refresh();
      toast.success("Cập nhật thông tin người dùng thành công");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
    setIsLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "white",
          p: 3,
          borderRadius: 3,
          width: { xs: "90%", sm: 500 },
          mx: "auto",
          mt: "5%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Cập nhật thông tin</Typography>
          <Typography sx={{ cursor: "pointer" }} onClick={onClose}>
            ✖
          </Typography>
        </Box>

        {/* COVER PHOTO */}
        <Box mt={2}>
          <Typography fontWeight={600}>Ảnh Cover</Typography>
          <img
            src={
              coverFile
                ? URL.createObjectURL(coverFile)
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.coverPhoto}`
            }
            style={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
          <Button component="label" fullWidth sx={{ mt: 1 }} variant="outlined">
            Thay đổi ảnh Cover
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* AVATAR */}
        <Stack alignItems="center">
          <Avatar
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.avatar}`
            }
            sx={{ width: 90, height: 90 }}
          />
          <Button component="label" sx={{ mt: 1 }}>
            Thay đổi Avatar
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </Button>
        </Stack>

        {/* FORM */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tên"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tuổi"
              type="number"
              fullWidth
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Địa chỉ"
              fullWidth
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Trường học"
              fullWidth
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Công việc"
              fullWidth
              value={form.work}
              onChange={(e) => setForm({ ...form, work: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Giới tính"
              fullWidth
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Số điện thoại"
              fullWidth
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </Grid>

          {/* NGÀY SINH */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Ngày sinh"
                value={form.birthday ? dayjs(form.birthday) : null}
                onChange={(newValue) => {
                  setForm({
                    ...form,
                    birthday: newValue ? newValue.format("YYYY-MM-DD") : "",
                  });
                }}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Mô tả bản thân"
              multiline
              rows={2}
              fullWidth
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Grid>
        </Grid>

        {/* SUBMIT */}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </Box>
    </Modal>
  );
}
