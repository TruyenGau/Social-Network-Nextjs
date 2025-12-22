"use client";

import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ErrorIcon from "@mui/icons-material/Error";
import { IUser } from "@/types/next-auth";
import { useThemeMode } from "@/lib/theme.mode.context";

interface IProps {
  data: IUser | null;
}

/* ================= STYLE ================= */

const menuStyle = {
  borderRadius: "8px",
  py: 1.25,
  minHeight: 44,
  px: 1,
  "&:hover": {
    bgcolor: "action.hover",
  },
};

import SidebarContent from "./sidebar.content";

export default function Sidebar({ data }: IProps) {
  if (!data) return null;

  const { mode, toggleMode } = useThemeMode();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 64,
        left: 0,
        width: { md: 260, lg: 300, xl: 320 },
        height: "calc(100vh - 64px)",
        pl: { xs: 0, md: 2 },
        pr: { xs: 0, md: 1 },
        overflowY: "auto",
        display: { xs: "none", md: "block" },
      }}
    >
      <SidebarContent data={data} />

      {/* THEME TOGGLE - stay here if needed later */}
      {/* <Box mt={3} px={1}>
        <ListItemButton
          onClick={toggleMode}
          sx={{
            borderRadius: "8px",
            minHeight: 44,
            px: 1,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText
            primary={mode === "light" ? "Chế độ tối" : "Chế độ sáng"}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>*/}

      {/* ================= THEME TOGGLE ================= */}
      {/* <Box mt={3} px={1}>
        <ListItemButton
          onClick={toggleMode}
          sx={{
            borderRadius: "8px",
            minHeight: 44,
            px: 1,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText
            primary={mode === "light" ? "Chế độ tối" : "Chế độ sáng"}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </Box> */}
    </Box>
  );
}
