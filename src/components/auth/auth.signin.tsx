"use client";

import {
  GitHub,
  Google,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const AuthSignIn = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isErrorUsername, setIsErrorUsername] = useState<boolean>(false);
  const [isErrorPassword, setIsErrorPassword] = useState<boolean>(false);

  const [errorUsername, setErrorUsername] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const [openMessage, setOpenMessage] = useState<boolean>(false);
  const [resMessage, setResMessage] = useState<string>("");
  const route = useRouter();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    setIsErrorUsername(false);
    setIsErrorPassword(false);
    setErrorUsername("");
    setErrorPassword("");

    if (!username) {
      setIsErrorUsername(true);
      setErrorUsername("Username can not be empty");
      return;
    }

    if (!password) {
      setIsErrorPassword(true);
      setErrorPassword("Password can not be empty");
      return;
    }

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (!res?.error) {
      route.refresh();
      router.push("/");
    } else {
      setOpenMessage(true);
      setResMessage(res.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // ✅ Ảnh nền (đặt file vào public/auth/signin-bg.jpg)
        backgroundImage: `url("/auth/signin-bg.jpg")`,
        backgroundSize: { xs: "cover", md: "90%" },   // ✅ thu nhỏ ảnh ở màn hình lớn
        backgroundPosition: { xs: "center", md: "left center" }, // ✅ canh trái để phần trắng bên phải rộng hơn
        backgroundRepeat: "no-repeat",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "center", md: "flex-end" }, // ✅ form nằm vùng trắng bên phải
        px: { xs: 2, md: 8 },
        pr: { xs: 2, md: 16 }, // ✅ khung vào trong
      }}
    >
      {/* lớp phủ nhẹ để chữ/form nổi hơn (tuỳ thích) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.10) 0%, rgba(15,23,42,0.04) 45%, rgba(255,255,255,0.00) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ✅ Khung Sign In nằm ở vùng trắng */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          position: "relative",

          // ✅ bo tròn hơn chút
          borderRadius: 5,

          p: { xs: 3, sm: 4 },

          // ✅ viền rất mỏng để card “tách” khỏi nền
          border: "1px solid rgba(15, 23, 42, 0.10)",

          // ✅ nền hơi trong + blur nhẹ (giữ như bạn đang dùng)
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",

          // ✅ shadow mềm, nhìn nổi hẳn lên (không gắt)
          boxShadow: `
        0 22px 60px rgba(2, 6, 23, 0.18),
        0 8px 18px rgba(2, 6, 23, 0.10)
        `,

          // ✅ (tuỳ chọn) nổi lên nhẹ khi hover
          transition: "transform 200ms ease, box-shadow 200ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `
        0 28px 70px rgba(2, 6, 23, 0.22),
        0 10px 22px rgba(2, 6, 23, 0.12)
        `,
          },

          mr: { xs: 0, md: 12 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Link href={"/"} style={{ display: "inline-flex" }}>
            <IconButton size="small" aria-label="Back">
              <ArrowBack />
            </IconButton>
          </Link>
          <Box sx={{ flex: 1 }} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>
            <Lock />
          </Avatar>
          <Typography component="h1" variant="h6" sx={{ fontWeight: 800 }}>
            Đăng Nhập
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Chào mừng bạn quay lại 👋
          </Typography>
        </Box>

        <Box component="form" onSubmit={(e) => e.preventDefault()}>
          <FormControl sx={{ width: "100%", mb: 2 }} variant="outlined">
            <TextField
              required
              id="outlined-adornment-username"
              type="text"
              label="Nhập Tài khoản"
              onChange={(e) => setUsername(e.target.value)}
              error={isErrorUsername}
              helperText={errorUsername}
              variant="outlined"
            />
          </FormControl>

          <FormControl sx={{ width: "100%", mb: 2 }} variant="outlined">
            <TextField
              required
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              label="Nhập Mật Khẩu"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "hide the password" : "display the password"}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setPassword(e.target.value)}
              error={isErrorPassword}
              helperText={errorPassword}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </FormControl>

          <Button
            variant="contained"
            sx={{
              width: "100%",
              py: 1.2,
              borderRadius: 3,
              fontWeight: 800,
            }}
            onClick={handleSubmit}
          >
            ĐĂNG NHẬP
          </Button>

          <Divider sx={{ width: "100%", my: 2 }}>Khác</Divider>

          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mb: 1 }}>
            <Avatar
              sx={{ cursor: "pointer", bgcolor: "#111827" }}
              onClick={() => signIn("github")}
            >
              <GitHub titleAccess="Đăng nhập với Github" />
            </Avatar>
            <Avatar
              sx={{ cursor: "pointer", bgcolor: "#F59E0B" }}
              onClick={() => signIn("google")}
            >
              <Google titleAccess="Đăng nhập với Google" />
            </Avatar>
          </Box>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Nếu bạn chưa có tài khoản?{" "}
            <Link href="/auth/signup" style={{ color: "#1976d2", fontWeight: 700 }}>
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={openMessage}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setOpenMessage(false)}
        >
          {resMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
