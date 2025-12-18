"use client";

import {
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
  Divider,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AuthSignUp = () => {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [age, setAge] = useState<string>(""); // nhập dạng string, lúc gửi sẽ parseInt
  const [gender, setGender] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isErrorName, setIsErrorName] = useState(false);
  const [isErrorEmail, setIsErrorEmail] = useState(false);
  const [isErrorPassword, setIsErrorPassword] = useState(false);
  const [isErrorConfirmPassword, setIsErrorConfirmPassword] = useState(false);
  const [isErrorAge, setIsErrorAge] = useState(false);
  const [isErrorGender, setIsErrorGender] = useState(false);
  const [isErrorAddress, setIsErrorAddress] = useState(false);

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorAge, setErrorAge] = useState("");
  const [errorGender, setErrorGender] = useState("");
  const [errorAddress, setErrorAddress] = useState("");

  const [openMessage, setOpenMessage] = useState(false);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [resMessage, setResMessage] = useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const resetError = () => {
    setIsErrorName(false);
    setIsErrorEmail(false);
    setIsErrorPassword(false);
    setIsErrorConfirmPassword(false);
    setIsErrorAge(false);
    setIsErrorGender(false);
    setIsErrorAddress(false);

    setErrorName("");
    setErrorEmail("");
    setErrorPassword("");
    setErrorConfirmPassword("");
    setErrorAge("");
    setErrorGender("");
    setErrorAddress("");
  };

  const validate = () => {
    let isValid = true;
    resetError();

    if (!name.trim()) {
      setIsErrorName(true);
      setErrorName("Tên không được để trống");
      isValid = false;
    }

    if (!email.trim()) {
      setIsErrorEmail(true);
      setErrorEmail("Email không được để trống");
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setIsErrorEmail(true);
      setErrorEmail("Email không hợp lệ");
      isValid = false;
    }

    if (!password) {
      setIsErrorPassword(true);
      setErrorPassword("Mật khẩu không được để trống");
      isValid = false;
    } else if (password.length < 3) {
      setIsErrorPassword(true);
      setErrorPassword("Mật khẩu phải từ 3 ký tự");
      isValid = false;
    }

    if (!confirmPassword) {
      setIsErrorConfirmPassword(true);
      setErrorConfirmPassword("Vui lòng nhập lại mật khẩu");
      isValid = false;
    } else if (confirmPassword !== password) {
      setIsErrorConfirmPassword(true);
      setErrorConfirmPassword("Mật khẩu nhập lại không khớp");
      isValid = false;
    }

    if (!age.trim()) {
      setIsErrorAge(true);
      setErrorAge("Tuổi không được để trống");
      isValid = false;
    } else {
      const ageNumber = parseInt(age, 10);
      if (Number.isNaN(ageNumber) || ageNumber <= 0) {
        setIsErrorAge(true);
        setErrorAge("Tuổi phải là số > 0");
        isValid = false;
      }
    }

    if (!gender.trim()) {
      setIsErrorGender(true);
      setErrorGender("Giới tính không được để trống");
      isValid = false;
    }

    if (!address.trim()) {
      setIsErrorAddress(true);
      setErrorAddress("Địa chỉ không được để trống");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // GỬI ĐÚNG THEO RegisterUserDto
        body: JSON.stringify({
          name,
          email,
          password,
          age: parseInt(age, 10),
          gender,
          address,
          role: "693d249213cc7e4a184854d8",
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        router.push("/auth/signin");
        setMessageType("success");
        setResMessage("Đăng ký thành công, hãy đăng nhập!");
        setOpenMessage(true);
      } else {
        setMessageType("error");
        setResMessage(data?.message || "Đăng ký thất bại");
        setOpenMessage(true);
      }
    } catch (error) {
      setMessageType("error");
      setResMessage("Có lỗi xảy ra, vui lòng thử lại");
      setOpenMessage(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: `url("/auth/signin-bg.jpg")`,
          backgroundSize: { xs: "cover", md: "90%" },
          backgroundPosition: { xs: "center", md: "left center" },
          backgroundRepeat: "no-repeat",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-end" },
          px: { xs: 2, md: 8 },
          pr: { xs: 2, md: 16 }, // ✅ vào trong giống signin
          py: { xs: 2, md: 0 },
        }}
      >
        {/* overlay nhẹ */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(15,23,42,0.10) 0%, rgba(15,23,42,0.04) 45%, rgba(255,255,255,0.00) 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Khung SignUp nổi lên */}
        <Box
          onKeyDown={handleKeyDown}
          sx={{
            width: "100%",
            maxWidth: 460,
            position: "relative",
            borderRadius: 5,
            border: "1px solid rgba(15, 23, 42, 0.10)",
            bgcolor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            boxShadow: `
            0 22px 60px rgba(2, 6, 23, 0.18),
            0 8px 18px rgba(2, 6, 23, 0.10)
          `,
            transition: "transform 200ms ease, box-shadow 200ms ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `
              0 28px 70px rgba(2, 6, 23, 0.22),
              0 10px 22px rgba(2, 6, 23, 0.12)
            `,
            },
            mr: { xs: 0, md: 12 },
            overflow: "hidden",
          }}
        >
          {/* Header card */}
          <Box sx={{ p: { xs: 2.5, sm: 3 }, pb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Link href={"/auth/signin"} style={{ display: "inline-flex" }}>
                <IconButton size="small" aria-label="Back">
                  <ArrowBack />
                </IconButton>
              </Link>
              <Box sx={{ flex: 1 }} />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>
                <Lock />
              </Avatar>
              <Typography component="h1" variant="h6" sx={{ fontWeight: 800 }}>
                Đăng Ký
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                Tạo tài khoản mới để bắt đầu ✨
              </Typography>
            </Box>
          </Box>

          {/* Body card - scroll nếu dài */}
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              pb: { xs: 2.5, sm: 3 },
              pt: 1,
              maxHeight: { xs: "calc(100vh - 120px)", md: "calc(100vh - 160px)" },
              overflowY: "auto",
            }}
          >
            {/* Name */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                required
                label="Tên hiển thị"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={isErrorName}
                helperText={errorName}
              />
            </FormControl>

            {/* Email */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                required
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={isErrorEmail}
                helperText={errorEmail}
              />
            </FormControl>

            {/* Password */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                required
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={isErrorPassword}
                helperText={errorPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "hide the password" : "display the password"}
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            {/* Confirm Password */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                required
                label="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={isErrorConfirmPassword}
                helperText={errorConfirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showConfirmPassword ? "hide the password" : "display the password"
                        }
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            {/* Age */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                required
                label="Tuổi"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={isErrorAge}
                helperText={errorAge}
              />
            </FormControl>

            {/* Gender */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                select
                required
                label="Giới tính"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                error={isErrorGender}
                helperText={errorGender}
              >
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </TextField>
            </FormControl>

            {/* Address */}
            <FormControl sx={{ width: "100%", mb: 1.4 }} variant="outlined">
              <TextField
                size="small"
                required
                label="Địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={isErrorAddress}
                helperText={errorAddress}
              />
            </FormControl>

            <Button
              variant="contained"
              sx={{
                width: "100%",
                mt: 1,
                py: 0.9,
                fontSize: "0.9rem",
                borderRadius: 3,
                fontWeight: 800,
              }}
              onClick={handleSubmit}
            >
              ĐĂNG KÝ
            </Button>

            <Divider sx={{ width: "100%", mt: 2, mb: 2 }} />

            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Đã có tài khoản?{" "}
              <Link href="/auth/signin" style={{ color: "#1976d2", fontWeight: 700 }}>
                Đăng nhập ngay
              </Link>
            </Typography>
          </Box>
        </Box>

        <Snackbar
          open={openMessage}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={() => setOpenMessage(false)}
        >
          <Alert
            severity={messageType}
            variant="filled"
            sx={{ width: "100%" }}
            onClose={() => setOpenMessage(false)}
          >
            {resMessage}
          </Alert>
        </Snackbar>
      </Box>
    </form>
  );

};
