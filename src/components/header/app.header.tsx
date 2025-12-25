"use client";
import * as React from "react";
import { styled, alpha, useTheme } from "@mui/material/styles";
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";

import ProfileInfomation from "@/components/profile/profile.info";
import SuggestionsFriend from "@/components/rightbar/friend";
import BirthdayUser from "@/components/rightbar/birthday";
import SponsoredAds from "@/components/rightbar/advertisement";
import MobileSidebar from "@/components/sidebar/mobile.sidebar";

import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { fetchDefaultImages, sendRequest } from "@/utils/api";
import { io, Socket } from "socket.io-client";

/* ================= STYLE ================= */

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 999,
  backgroundColor: "#f0f2f5",
  width: "100%",
  maxWidth: 260,
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
})<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: 8,
  padding: "10px 24px",
  [theme.breakpoints.down("sm")]: {
    padding: "8px 12px",
  },
  color: active ? "#1877f2" : "#65676b",
  borderBottom: active ? "3px solid #1877f2" : "3px solid transparent",
}));

/* ================= COMPONENT ================= */

export default function AppHeader() {
  const getSender = (n: any) => n.fromUser || n.fromUserId || {};

  const router = useRouter();
  const { data: session } = useSession();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [anchorNoti, setAnchorNoti] = React.useState<HTMLElement | null>(null);
  const [anchorGroupInvite, setAnchorGroupInvite] =
    React.useState<HTMLElement | null>(null);

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Mobile right panel state
  const [mobileRightOpen, setMobileRightOpen] = React.useState(false);

  // responsive helpers
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

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

  const [searchText, setSearchText] = React.useState("");
  const [searchResult, setSearchResult] = React.useState<{
    users: any[];
    posts: any[];
  }>({ users: [], posts: [] });

  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement | null>(null);

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

  React.useEffect(() => {
    if (!searchText || searchText.trim().length < 2) {
      setSearchResult({ users: [], posts: [] });
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await sendRequest<any>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/global/search`,
          method: "GET",
          queryParams: { q: searchText },
        });

        // 🔥 FIX QUAN TRỌNG
        setSearchResult(res?.data ?? { users: [], posts: [] });
        setSearchOpen(true);
      } catch (err) {
        console.error("Search error", err);
        setSearchResult({ users: [], posts: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Mobile menu button */}
          <IconButton
            sx={{ display: { xs: "block", md: "none" } }}
            onClick={() => setMobileOpen(true)}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>

          <Typography
            fontWeight={800}
            fontSize={24}
            color="#1877f2"
            sx={{ cursor: "pointer", display: { xs: "none", sm: "block" } }}
            onClick={() => router.push("/")}
          >
            MEO
          </Typography>

          <Search sx={{ display: { xs: "none", sm: "flex" } }} ref={searchRef}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm trên MEO"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            {searchOpen &&
              (searchResult.users.length > 0 ||
                searchResult.posts.length > 0) && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 48,
                    left: 0,
                    width: "300",
                    bgcolor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    borderRadius: 2,
                    zIndex: 2000,
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
                  {/* USERS */}
                  {searchResult.users.length > 0 && (
                    <>
                      <Typography px={2} py={1} fontWeight={700} fontSize={13}>
                        Người dùng
                      </Typography>

                      {searchResult.users.map((u) => (
                        <MenuItem
                          key={u._id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchText("");
                            router.push(`/profile/${u._id}`);
                          }}
                        >
                          <Avatar
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                              u.avatar || "/user/default-user.png"
                            }`}
                            sx={{ mr: 1 }}
                          />
                          {u.name}
                        </MenuItem>
                      ))}
                    </>
                  )}

                  {/* POSTS */}
                  {searchResult.posts.length > 0 && (
                    <>
                      <Divider />
                      <Typography px={2} py={1} fontWeight={700} fontSize={13}>
                        Bài viết
                      </Typography>

                      {searchResult.posts.map((p) => (
                        <MenuItem
                          key={p._id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchText("");
                            // 👉 CÁCH 1: redirect về home kèm postId
                            router.push(`/?post=${p._id}`);
                          }}
                        >
                          <Avatar
                            src={
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/${p.userId?.avatar}` ||
                              "/user/default-user.png"
                            }
                            sx={{ mr: 1 }}
                          />
                          <Box>
                            <Typography fontSize={14} fontWeight={600}>
                              {p.userId?.name}
                            </Typography>
                            <Typography
                              fontSize={13}
                              color="text.secondary"
                              noWrap
                            >
                              {p.content}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Box>
              )}
          </Search>

          {/* Mobile search icon (placeholder for future search dialog) */}
          <IconButton sx={{ display: { xs: "block", sm: "none" } }}>
            <SearchIcon />
          </IconButton>
        </Box>

        {/* ========== CENTER ========== */}
        <Box
          display="flex"
          alignItems="center"
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
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

            {/* Mobile right panel button */}
            <IconButton
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={() => setMobileRightOpen(true)}
            >
              <PeopleIcon />
            </IconButton>

            <Avatar
              src={
                session?.user?.avatar
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${session.user.avatar}`
                  : "/user/default-user.png"
              }
              sx={{ cursor: "pointer" }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            />
          </Box>
        )}
      </Toolbar>

      {/* ========== MOBILE DRAWER ========== */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        {/* Use MobileSidebar so left Drawer mirrors full desktop Sidebar */}
        <Box role="presentation">
          <MobileSidebar onClose={() => setMobileOpen(false)} />
        </Box>
      </Drawer>

      {/* ========== MOBILE RIGHT DRAWER ========== */}
      <Drawer
        anchor={isXs ? "bottom" : "right"}
        open={mobileRightOpen}
        onClose={() => setMobileRightOpen(false)}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: 340 },
            height: isXs ? "45vh" : "auto",
            p: 2,
          }}
          role="presentation"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography fontWeight={700}>Tùy chọn</Typography>
            <IconButton onClick={() => setMobileRightOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box mb={2}>
            <ProfileInfomation />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box mb={2}>
            <SuggestionsFriend suggesionFriend={null} />
          </Box>

          <Box mb={2}>
            <BirthdayUser />
          </Box>

          <Box mb={2}>
            <SponsoredAds />
          </Box>
        </Box>
      </Drawer>

      {/* ========== NOTIFICATION MENU ========== */}
      <Menu
        anchorEl={anchorNoti}
        open={Boolean(anchorNoti)}
        onClose={() => setAnchorNoti(null)}
        sx={{ maxHeight: 500, width: 360 }}
      >
        {notifications.length === 0 && <MenuItem>Không có thông báo</MenuItem>}

        {notifications.map((n: any) => {
          const sender = getSender(n);

          return (
            <MenuItem
              key={n._id}
              onClick={async () => {
                setAnchorNoti(null);

                if (!n.isRead) {
                  await handleMarkRead(n._id);

                  // 🔥 UPDATE LOCAL STATE
                  setNotifications((prev) =>
                    prev.map((item) =>
                      item._id === n._id ? { ...item, isRead: true } : item
                    )
                  );

                  setUnread((u) => Math.max(0, u - 1));
                }

                if (n.postId) router.push(`/?post=${n.postId}`);
              }}
              sx={{
                alignItems: "flex-start",
                gap: 1.5,
                bgcolor: !n.isRead ? "#e7f3ff" : "transparent",
                borderRadius: 2,
                py: 1,
                "&:hover": {
                  bgcolor: "#f0f2f5",
                },
              }}
            >
              {/* AVATAR */}
              <Avatar
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                  sender.avatar || "/user/default-user.png"
                }`}
                sx={{ width: 40, height: 40 }}
              />

              {/* TEXT */}
              <Box>
                <Typography fontSize={14} lineHeight={1.4}>
                  <b>{sender.name || "Ai đó"}</b>{" "}
                  {n.type === "LIKE" && "đã thích bài viết của bạn"}
                  {n.type === "COMMENT" && "đã bình luận bài viết của bạn"}
                  {n.type === "CHAT_PRIVATE" && "đã gửi cho bạn một tin nhắn"}
                  {n.type === "CHAT_GROUP" && "đã gửi tin nhắn trong nhóm"}
                </Typography>

                <Typography fontSize={12} color="text.secondary">
                  Vừa xong
                </Typography>
              </Box>

              {/* DOT CHƯA ĐỌC */}
              {!n.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: "#1877f2",
                    borderRadius: "50%",
                    mt: 1,
                    ml: "auto",
                  }}
                />
              )}
            </MenuItem>
          );
        })}
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

                // 🔥 UPDATE LOCAL STATE
                setNotifications((prev) =>
                  prev.map((item) =>
                    item._id === n._id ? { ...item, isRead: true } : item
                  )
                );

                setUnread((u) => Math.max(0, u - 1));
              }

              router.push("/invite");
            }}
          >
            <Avatar
              src={
                n.fromUserId?.avatar
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${n.fromUserId?.avatar}`
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
          Thông Tin Cá Nhân
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
          Đăng Xuất
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
