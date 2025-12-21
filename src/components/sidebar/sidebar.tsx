"use client";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import ProfileCard from "../profile/profile.card";
import { IUser } from "@/types/next-auth";

interface IProps {
  data: IUser | null;
}

const menuStyle = {
  borderRadius: "8px",
  py: 1.25, // 👈 tăng chiều cao dòng
  minHeight: 44,
  px: 1, // 👈 ép padding đồng bộ
  "&:hover": {
    bgcolor: "#f0f2f5",
  },
};

export default function Sidebar({ data }: IProps) {
  if (!data) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 64,
        left: 0,
        width: 300,
        height: "calc(100vh - 64px)",
        pl: 2,
        pr: 1,
        overflowY: "auto",
        display: { xs: "none", md: "block" },
      }}
    >
      {/* PROFILE + MENU */}
      <List>
        {/* PROFILE */}
        <ListItem disablePadding>
          <ListItemButton
            href={`/profile/${data._id}`}
            sx={{
              ...menuStyle,
              mb: 0.5,
            }}
          >
            <Avatar
              src={
                data.avatar
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${data.avatar}`
                  : "/user/default-user.png"
              }
              sx={{ width: 36, height: 36, mr: 1.5 }}
            />
            <ListItemText
              primary={data.name}
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        {/* MENU ITEM */}
        <ListItem disablePadding>
          <ListItemButton href="/" sx={menuStyle}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              {" "}
              {/* 👈 MẤU CHỐT */}
              <HomeIcon sx={{ color: "#1877F2", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Trang Chủ"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={menuStyle}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <ArticleIcon sx={{ color: "#f02849", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Bài Viết"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton href="/community" sx={menuStyle}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <GroupsIcon sx={{ color: "#42b72a", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Nhóm"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton href="/chat" sx={menuStyle}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <PeopleIcon sx={{ color: "#1877F2", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Bạn Bè"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton href="/invite" sx={menuStyle}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <GroupAddIcon sx={{ color: "#8b6be8", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Lời Mời Vào Nhóm"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton href="/music" sx={menuStyle}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <OndemandVideoIcon sx={{ color: "#f5533d", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Giải trí"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Box mt={2}>
        <Typography
          fontSize={15}
          fontWeight={600}
          color="#65676B"
          sx={{ px: 1, mb: 1 }}
        >
          Lối tắt
        </Typography>

        <List dense>
          {[
            { label: "Nhóm CNTT", icon: "👨‍💻" },
            { label: "TigerStudy", icon: "🐯" },
            { label: "Học React", icon: "⚛️" },
          ].map((item) => (
            <ListItemButton
              key={item.label}
              sx={{
                borderRadius: "8px",
                minHeight: 44, // 👈 QUAN TRỌNG
                px: 1,
                "&:hover": { bgcolor: "#f0f2f5" },
              }}
            >
              <Box
                sx={{
                  minWidth: 28, // 👈 GIỐNG ListItemIcon
                  display: "flex",
                  justifyContent: "center",
                  mr: 1,
                  fontSize: 18,
                }}
              >
                {item.icon}
              </Box>

              <Typography fontSize={14} fontWeight={500}>
                {item.label}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
}