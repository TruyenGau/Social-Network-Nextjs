"use client";
import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import Link from "next/link";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { fetchDefaultImages, sendRequest } from "@/utils/api";
import { io, Socket } from "socket.io-client";

/* ================= STYLE ================= */

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "300px",
    },
  },
}));

/* ================= COMPONENT ================= */

export default function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [anchorNoti, setAnchorNoti] = React.useState<HTMLElement | null>(null);

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unread, setUnread] = React.useState(0);

  const [chatUnread, setChatUnread] = React.useState(0);
  const [lastChatTarget, setLastChatTarget] = React.useState<{
    type: "private" | "group";
    userId?: string;
    roomId?: string;
  } | null>(null);

  const socketRef = React.useRef<Socket | null>(null);

  /* ================= LOAD NOTI FROM API ================= */

  const loadNotifications = async () => {
    if (!session?.access_token) return;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res?.data) {
      setNotifications(res.data);
      setUnread(res.data.filter((n: any) => !n.isRead).length);
    }
  };

  React.useEffect(() => {
    loadNotifications();
  }, [session?.access_token]);

  /* ================= SOCKET: /notifications ================= */

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
    });

    return () => {
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
    <Box sx={{ padding: "15px" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#41bd4bff" }}>
        <Toolbar sx={{ minHeight: "64px" }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer", mr: 2 }}
            onClick={() => router.push("/")}
          >
            MEO MEO
          </Typography>

          <Search sx={{ mx: "auto", maxWidth: 600 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Tìm kiếm..." />
          </Search>

          {session && (
            <>
              {/* CHAT ICON */}
              <IconButton
                color="inherit"
                onClick={() => {
                  if (!lastChatTarget) {
                    router.push("/chat");
                  } else if (
                    lastChatTarget.type === "private" &&
                    lastChatTarget.userId
                  ) {
                    router.push(`/chat?userId=${lastChatTarget.userId}`);
                  } else if (
                    lastChatTarget.type === "group" &&
                    lastChatTarget.roomId
                  ) {
                    router.push(
                      `/chat?roomId=${lastChatTarget.roomId}&type=group`
                    );
                  } else {
                    router.push("/chat");
                  }
                  setChatUnread(0);
                }}
              >
                <Badge badgeContent={chatUnread} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>

              {/* NOTIFICATION ICON */}
              <IconButton
                color="inherit"
                onClick={(e) => setAnchorNoti(e.currentTarget)}
              >
                <Badge badgeContent={unread} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* PROFILE */}
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <AccountCircle />
              </IconButton>

              <Image
                src={fetchDefaultImages(session.user?.type)}
                alt=""
                width={35}
                height={35}
                style={{ borderRadius: "50%", cursor: "pointer" }}
                onClick={(e) => setAnchorEl(e.currentTarget as any)}
              />
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* NOTIFICATION MENU */}
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
                setUnread((u) => u - 1);
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

      {/* PROFILE MENU */}
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
            {" "}
            <Link
              href={"/admin"}
              style={{ textDecoration: "none", color: "unset" }}
            >
              {" "}
              Trang Admin{" "}
            </Link>{" "}
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
    </Box>
  );
}
