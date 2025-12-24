import React, { useEffect, useState } from "react";
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
import ErrorIcon from "@mui/icons-material/Error";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";

interface Props {
  data: IUser | null;
  onNavigate?: () => void;
}

export default function SidebarContent({ data, onNavigate }: Props) {
  const [joinedGroups, setJoinedGroups] = useState<IGroups[]>([]);
  const { data: session } = useSession();
  useEffect(() => {
    if (!data) return;

    const fetchJoinedGroups = async () => {
      const res = await sendRequest<IBackendRes<IModelPaginate<IGroups>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const groups = res?.data?.result ?? [];

      // ✅ chỉ lấy nhóm đã tham gia
      setJoinedGroups(groups.filter((g) => g.isJoined));
      console.log("Fetched groups for sidebar:", res);
    };

    fetchJoinedGroups();
  }, [data, session?.access_token]);

  return (
    <Box>
      <List>
        {/* ================= PROFILE ================= */}
        {data && (
          <ListItem disablePadding>
            <ListItemButton
              href={`/profile/${data._id}`}
              sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
              onClick={onNavigate}
            >
              <Avatar
                src={data.avatar ? data.avatar : "/user/default-user.png"}
                sx={{ width: 36, height: 36, mr: 1.5 }}
              />
              <ListItemText
                primary={data.name}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        )}

        {/* ================= MENU ================= */}
        <ListItem disablePadding>
          <ListItemButton
            href="/"
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <HomeIcon sx={{ color: "#1877F2", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Trang Chủ" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <ArticleIcon sx={{ color: "#f02849", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Bài Viết" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            href="/community"
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <GroupsIcon sx={{ color: "#42b72a", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Nhóm" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            href="/chat"
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <PeopleIcon sx={{ color: "#1877F2", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Bạn Bè" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            href="/invite"
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <GroupAddIcon sx={{ color: "#8b6be8", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Lời Mời Vào Nhóm" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            href="/music"
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <OndemandVideoIcon sx={{ color: "#f5533d", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Giải Trí" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            href="/spam"
            sx={{ borderRadius: "8px", py: 1.25, minHeight: 44, px: 1 }}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <ErrorIcon sx={{ color: "#f5533d", fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primary="Cảnh Báo" />
          </ListItemButton>
        </ListItem>
      </List>

      <List dense>
        <Box mt={2}>
          <Typography
            fontSize={15}
            fontWeight={600}
            color="text.secondary"
            sx={{ px: 1, mb: 1 }}
          >
            Lối tắt
          </Typography>

          <List dense>
            {joinedGroups.length === 0 && (
              <Typography fontSize={13} color="text.secondary" sx={{ px: 1 }}>
                Chưa tham gia nhóm nào
              </Typography>
            )}

            {joinedGroups.slice(0, 5).map((group) => (
              <ListItemButton
                key={group._id}
                href={`/groups/${group._id}`}
                onClick={onNavigate}
                sx={{
                  borderRadius: "8px",
                  minHeight: 44,
                  px: 1,
                  "&:hover": { bgcolor: "action.hover" },
                  mb: 0.5,
                }}
              >
                <Avatar
                  src={group.avatar}
                  sx={{ width: 28, height: 28, mr: 1 }}
                />
                <Typography fontSize={14} fontWeight={500} noWrap>
                  {group.name}
                </Typography>
              </ListItemButton>
            ))}

            {joinedGroups.length > 5 && (
              <Typography
                fontSize={14}
                color="#1877F2"
                fontWeight={600}
                sx={{ px: 1, cursor: "pointer", mt: 0.5 }}
                onClick={() =>
                  (window.location.href = "/community?joined=true")
                }
              >
                Xem tất cả →
              </Typography>
            )}
          </List>
        </Box>
      </List>
    </Box>
  );
}
