"use client";
import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  MenuItem,
  Menu,
  Avatar,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { fetchDefaultImages, sendRequest } from "@/utils/api";
import { io, Socket } from "socket.io-client";

/* ================= STYLE ================= */

const Search = styled("div")(() => ({
  position: "relative",
  borderRadius: 999,
  backgroundColor: "#f0f2f5",
  width: 260,
  height: 40,
  display: "flex",
  alignItems: "center",
}));

const SearchIconWrapper = styled("div")({
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  color: "#65676b",
});

const StyledInputBase = styled(InputBase)({
  color: "#050505",
  width: "100%",
  "& .MuiInputBase-input": {
    fontSize: 14,
  },
});

const CenterIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
  borderRadius: 8,
  padding: "10px 36px",
  color: active ? "#1877f2" : "#65676b",
  borderBottom: active ? "3px solid #1877f2" : "3px solid transparent",
}));

/* ================= COMPONENT ================= */

export default function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [anchorNoti, setAnchorNoti] = React.useState<HTMLElement | null>(null);
  const [anchorGroupInvite, setAnchorGroupInvite] =
    React.useState<HTMLElement | null>(null);

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unread, setUnread] = React.useState(0);

  const [chatUnread, setChatUnread] = React.useState(0);
  const [lastChatTarget, setLastChatTarget] = React.useState<{
    type: "private" | "group";
    userId?: string;
    roomId?: string;
  } | null>(null);

  const socketRef = React.useRef<Socket | null>(null);

  const [groupInvites, setGroupInvites] = React.useState<any[]>([]);
  const [groupInviteUnread, setGroupInviteUnread] = React.useState(0);
  const pathname = usePathname();
  const centerTabs = [
    {
      key: "home",
      path: "/",
      icon: <HomeIcon fontSize="large" />,
    },
    {
      key: "video",
      path: "/video",
      icon: <OndemandVideoIcon fontSize="large" />,
    },
    {
      key: "community",
      path: "/community",
      icon: <GroupsIcon fontSize="large" />,
    },
    {
      key: "game",
      path: "/music",
      icon: <SportsEsportsIcon fontSize="large" />,
    },
  ];

  /* ================= LOAD NOTIFICATIONS ================= */

  const loadNotifications = async () => {
    if (!session?.access_token) return;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      nextOption: { cache: "no-store" },
    });

    if (!res?.data) return;

    const normal = res.data.filter((n: any) => n.type !== "GROUP_INVITE");
    const invites = res.data.filter((n: any) => n.type === "GROUP_INVITE");

    setNotifications(normal);
    setUnread(normal.filter((n: any) => !n.isRead).length);

    setGroupInvites(invites);
    setGroupInviteUnread(invites.filter((n: any) => !n.isRead).length);
  };

  React.useEffect(() => {
    loadNotifications();
  }, [session?.access_token]);

  /* ================= SOCKET ================= */

  React.useEffect(() => {
    if (!session?.access_token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
      auth: { token: `Bearer ${session.access_token}` },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("notification", (data) => {
      // LIKE / COMMENT
      if (data.type === "LIKE" || data.type === "COMMENT") {
        setNotifications((prev) => [data, ...prev]);
        setUnread((u) => u + 1);
      }

      // CHAT PRIVATE
      if (data.type === "CHAT_PRIVATE") {
        setChatUnread((u) => u + 1);
        setLastChatTarget({
          type: "private",
          userId: data.senderId,
        });
      }

      // CHAT GROUP
      if (data.type === "CHAT_GROUP") {
        setChatUnread((u) => u + 1);
        setLastChatTarget({
          type: "group",
          roomId: data.roomId,
        });
      }

      // GROUP INVITE
      if (data.type === "GROUP_INVITE") {
        setGroupInvites((prev) => [data, ...prev]);
        setGroupInviteUnread((u) => u + 1);
      }
    });

    // ✅ CLEANUP ĐÚNG
    return () => {
      socket.off("notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.access_token]);

  /* ================= MARK READ ================= */

  const handleMarkRead = async (id: string) => {
    await sendRequest({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/${id}/read`,
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
  };

  /* ================= RENDER ================= */

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{ bgcolor: "#fff", color: "#000" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* ========== LEFT ========== */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            fontWeight={800}
            fontSize={24}
            color="#1877f2"
            sx={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
          >
            MEO
          </Typography>

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Tìm kiếm trên MEO" />
          </Search>
        </Box>

        {/* ========== CENTER ========== */}
        <Box display="flex" alignItems="center">
          {centerTabs.map((tab) => {
            const isActive =
              tab.path === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.path);

            return (
              <CenterIconButton
                key={tab.key}
                active={isActive}
                onClick={() => router.push(tab.path)}
              >
                {tab.icon}
              </CenterIconButton>
            );
          })}
        </Box>

        {/* ========== RIGHT ========== */}
        {session && (
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => {
                if (!lastChatTarget) router.push("/chat");
                else if (lastChatTarget.type === "private")
                  router.push(`/chat?userId=${lastChatTarget.userId}`);
                else
                  router.push(
                    `/chat?roomId=${lastChatTarget.roomId}&type=group`
                  );
                setChatUnread(0);
              }}
            >
              <Badge badgeContent={chatUnread} color="error">
                <MailIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={(e) => setAnchorGroupInvite(e.currentTarget)}>
              <Badge badgeContent={groupInviteUnread} color="error">
                <GroupAddIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={(e) => setAnchorNoti(e.currentTarget)}>
              <Badge badgeContent={unread} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Avatar
              src={fetchDefaultImages(session.user?.type)}
              sx={{ cursor: "pointer" }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            />
          </Box>
        )}
      </Toolbar>

      {/* ========== NOTIFICATION MENU ========== */}
      <Menu
        anchorEl={anchorNoti}
        open={Boolean(anchorNoti)}
        onClose={() => setAnchorNoti(null)}
        sx={{ maxHeight: 500, width: 360 }}
      >
        {notifications.length === 0 && <MenuItem>Không có thông báo</MenuItem>}

        {notifications.map((n: any) => (
          <MenuItem
            key={n._id}
            onClick={async () => {
              setAnchorNoti(null);
              if (!n.isRead) {
                await handleMarkRead(n._id);
                setUnread((u) => Math.max(0, u - 1));
              }
              if (n.postId) router.push(`/?post=${n.postId}`);
            }}
          >
            {n.type === "LIKE" && "👍 Đã thích bài viết của bạn"}
            {n.type === "COMMENT" && "💬 Đã bình luận bài viết của bạn"}
            {n.type === "CHAT_PRIVATE" && "📩 Tin nhắn mới"}
            {n.type === "CHAT_GROUP" && "👥 Tin nhắn nhóm"}
          </MenuItem>
        ))}
      </Menu>

      {/* ========== GROUP INVITE MENU ========== */}
      <Menu
        anchorEl={anchorGroupInvite}
        open={Boolean(anchorGroupInvite)}
        onClose={() => setAnchorGroupInvite(null)}
        sx={{ maxHeight: 400, width: 360 }}
      >
        {groupInvites.length === 0 && <MenuItem>Không có lời mời</MenuItem>}

        {groupInvites.map((n: any) => (
          <MenuItem
            key={n._id}
            onClick={async () => {
              setAnchorGroupInvite(null);
              if (!n.isRead) {
                await handleMarkRead(n._id);
                setGroupInviteUnread((u) => Math.max(0, u - 1));
              }
              router.push("/invite");
            }}
          >
            <Avatar
              src={
                n.fromUserId?.avatar
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${n.fromUserId.avatar}`
                  : "/user/default-user.png"
              }
              sx={{ mr: 1 }}
            />
            <b>{n.fromUserId?.name}</b>&nbsp;đã mời bạn tham gia nhóm
          </MenuItem>
        ))}
      </Menu>

      {/* ========== PROFILE MENU ========== */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => router.push(`/profile/${session?.user?._id}`)}>
          Profile
        </MenuItem>
        {session?.user.role.name === "SUPER_ADMIN" && (
          <MenuItem>
            <Link
              href="/admin"
              style={{ textDecoration: "none", color: "unset" }}
            >
              Trang Admin
            </Link>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            signOut();
            redirect("/auth/signin");
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
