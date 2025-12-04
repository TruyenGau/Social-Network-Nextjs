"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Fab,
  Paper,
  Stack,
} from "@mui/material";
import {
  Home,
  Article,
  Group,
  Person,
  Settings,
  AccountBox,
  Add,
} from "@mui/icons-material";
import CreatePostModal from "../post/createPost";
import ProfileCard from "../profile/profile.card";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { IUser } from "@/types/next-auth";
interface IProps {
  data: IUser | null;
}

export default function Sidebar(props: IProps) {
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const user = props.data;
  const { data: session } = useSession();

  return (
    <Box
      flex={1}
      sx={{ display: { xs: "none", sm: "block" }, marginLeft: "15px" }}
    >
      {/* 👉 Dùng STACK ĐỂ TÁCH 2 KHUNG */}
      <Stack
        direction="column"
        spacing={1} // khoảng cách giữa 2 khung
        sx={{ position: "fixed", width: "325px", mt: "20px" }}
      >
        {/* ===== KHUNG 1: PROFILE CARD ===== */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: "20px",
            p: 2,
            bgcolor: "white",
            transition: "all 0.3s ease",
          }}
        >
          <ProfileCard
            id={user?._id ?? ""}
            name={user?.name ?? ""}
            followers={user?.followersCount ?? 0}
            avatarUrl={user?.avatar ?? ""}
            coverUrl={user?.coverPhoto ?? ""}
          />
        </Paper>

        {/* ===== KHUNG 2: MENU SIDEBAR ===== */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: "20px",
            p: 2,
            bgcolor: "white",
            transition: "all 0.3s ease",
          }}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href="/"
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#f0f4ff" } }}
              >
                <ListItemIcon>
                  <Home sx={{ color: "#007bff" }} />
                </ListItemIcon>
                <ListItemText primary="Trang Chủ" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#fff6e5" } }}
                component="a"
                href="#"
              >
                <ListItemIcon>
                  <Article sx={{ color: "#ff9800" }} />
                </ListItemIcon>
                <ListItemText primary="Bài Viết" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#e8f5e9" } }}
                component="a"
                href="#"
              >
                <ListItemIcon>
                  <Group sx={{ color: "#4caf50" }} />
                </ListItemIcon>
                <ListItemText primary="Nhóm" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#fff3e0" } }}
                component="a"
                href="/chat"
              >
                <ListItemIcon>
                  <Person sx={{ color: "#795548" }} />
                </ListItemIcon>
                <ListItemText primary="Bạn Bè" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#fce4ec" } }}
                component="a"
                href="#"
              >
                <ListItemIcon>
                  <Settings sx={{ color: "#e91e63" }} />
                </ListItemIcon>
                <ListItemText primary="Cài đặt" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ borderRadius: "12px", "&:hover": { bgcolor: "#ede7f6" } }}
                component="a"
                href="#"
              >
                <ListItemIcon>
                  <AccountBox sx={{ color: "#673ab7" }} />
                </ListItemIcon>
                <ListItemText primary="Thông Tin Cá Nhân" />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>
      </Stack>

      {/* Nút post */}
      {/* <Fab
        color="primary"
        onClick={() => setOpenCreatePost(true)}
        sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 9999 }}
      >
        <Add />
      </Fab> */}

      {/* <CreatePostModal
        open={openCreatePost}
        onClose={() => setOpenCreatePost(false)}
      /> */}
    </Box>
  );
}
