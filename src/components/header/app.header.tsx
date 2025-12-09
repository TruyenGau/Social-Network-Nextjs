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
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { fetchDefaultImages } from "@/utils/api";

// 🔥 ADDED
import { io, Socket } from "socket.io-client";
import { sendRequest } from "@/utils/api";

let socket: Socket | null = null;

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
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
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "300px",
    },
  },
}));

export default function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<HTMLElement | null>(null);

  // 🔥 Notification State
  const [anchorNoti, setAnchorNoti] = React.useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unread, setUnread] = React.useState(0);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  // =====================================================================
  // 🔥 1) API: FETCH NOTIFICATION (theo style sendRequest của bạn)
  // =====================================================================
  // const loadNotifications = async () => {
  //   if (!session?.access_token) return;

  //   const res = await sendRequest<IBackendRes<any>>({
  //     url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications`,
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${session.access_token}`,
  //     },
  //   });

  //   if (res?.data) {
  //     setNotifications(res.data);
  //     setUnread(res.data.filter((n: any) => !n.isRead).length);
  //   }
  // };

  // =====================================================================
  // 🔥 2) API MARK READ
  // =====================================================================
  // const handleMarkRead = async (id: string) => {
  //   await sendRequest({
  //     url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications/${id}/read`,
  //     method: "PATCH",
  //     headers: { Authorization: `Bearer ${session?.access_token}` },
  //   });
  // };

  // =====================================================================
  // 🔥 3) SOCKET REALTIME
  // =====================================================================
  // React.useEffect(() => {
  //   if (!session?.user?._id) return;

  //   socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
  //     query: { userId: session.user._id },
  //     transports: ["websocket"],
  //   });

  //   socket.on("notification", (data) => {
  //     setNotifications((prev) => [data, ...prev]);
  //     setUnread((u) => u + 1);
  //   });

  //   return () => {
  //     socket?.disconnect();
  //   };
  // }, [session?.user?._id]);

  // =====================================================================
  // 🔥 4) LOAD NOTIFICATION LÚC LOGIN
  // =====================================================================
  // React.useEffect(() => {
  //   loadNotifications();
  // }, [session]);

  // =====================================================================
  // MENU PROFILE
  // =====================================================================
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setMobileMoreAnchorEl(event.currentTarget);

  const handleRederectHome = () => router.push("/");

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <Box sx={{ padding: "15px" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#41bd4bff" }}>
        <Toolbar sx={{ position: "relative", px: "5px", minHeight: "64px" }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              display: { xs: "none", sm: "block" },
              cursor: "pointer",
              mr: 2,
            }}
            onClick={handleRederectHome}
          >
            MEO MEO
          </Typography>

          <Search
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: { xs: "70%", sm: "60%", md: "50%" },
              maxWidth: "600px",
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Tìm kiếm..." />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          {/* ================== RIGHT ICON ================== */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "20px",
              alignItems: "center",
            }}
          >
            {session ? (
              <>
                {/* MAIL */}
                <IconButton size="large" color="inherit">
                  <Badge badgeContent={0} color="error">
                    <MailIcon />
                  </Badge>
                </IconButton>

                {/* 🔥 NOTIFICATION */}
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={(e) => setAnchorNoti(e.currentTarget)}
                >
                  <Badge badgeContent={unread} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* PROFILE */}
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                >
                  <AccountCircle />
                </IconButton>

                <Image
                  onClick={handleProfileMenuOpen}
                  style={{ height: 35, width: 35, cursor: "pointer" }}
                  src={fetchDefaultImages(session?.user?.type)}
                  alt=""
                  height={35}
                  width={35}
                />
              </>
            ) : (
              <Link
                href="/auth/signin"
                style={{ color: "#fff", textDecoration: "none" }}
              >
                Login
              </Link>
            )}
          </Box>

          {/* MOBILE ICON */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-controls="primary-search-account-menu-mobile"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🔥 DROPDOWN NOTIFICATION */}
      <Menu
        anchorEl={anchorNoti}
        open={Boolean(anchorNoti)}
        onClose={() => setAnchorNoti(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ maxHeight: 500, width: 360 }}
      >
        {notifications.length === 0 && <MenuItem>Không có thông báo</MenuItem>}

        {notifications.map((n: any, idx: number) => {
          const user = n.fromUserId;
          const avatarUrl = user?.avatar
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.avatar}`
            : "/default-avatar.png";

          return (
            <MenuItem
              key={idx}
              sx={{
                whiteSpace: "normal",
                alignItems: "flex-start",
                gap: 1.8,
                paddingY: 1.6,
                paddingX: 1.8,
                backgroundColor: !n.isRead ? "#e8f4ff" : "white",
                borderBottom: "1px solid #e5e5e5",
                cursor: "pointer",
                width: "360px",
                display: "flex",
              }}
              // onClick={async () => {
              //   setAnchorNoti(null);

              //   if (!n.isRead) {
              //     await handleMarkRead(n._id);
              //     setNotifications((prev) =>
              //       prev.map((x) =>
              //         x._id === n._id ? { ...x, isRead: true } : x
              //       )
              //     );
              //     setUnread((u) => u - 1);
              //   }

              //   router.push(`/?post=${n.postId}`);
              // }}
            >
              {/* Avatar */}
              <img
                src={avatarUrl}
                width="50"
                height="50"
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                alt="avatar"
              />

              {/* Text */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  {user?.name}
                </Typography>

                <Typography sx={{ fontSize: "0.9rem", color: "#333" }}>
                  {n.type === "LIKE"
                    ? "đã thích bài viết của bạn"
                    : "đã bình luận bài viết của bạn"}
                </Typography>

                <Typography
                  sx={{ fontSize: "0.75rem", color: "#777", marginTop: "4px" }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>

      {/* PROFILE MENU */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem>
          <Link
            href={`/profile/${session?.user?._id}`}
            style={{ textDecoration: "none", color: "unset" }}
          >
            Profile
          </Link>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            signOut();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
