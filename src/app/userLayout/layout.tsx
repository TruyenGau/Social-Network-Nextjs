import AppHeader from "@/components/header/app.header";
import { Box, Stack } from "@mui/material";

import RightBar from "../(user)/rightbar";
import SideBarSever from "../(user)/sidebar.sever";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F7FB" }}>
      <AppHeader />

      {/* LEFT SIDEBAR */}
      <SideBarSever />

      {/* CENTER FEED */}
      <Box
        sx={{
          mt: "60px",
          maxWidth: 760,
          mx: "auto", // 👈 CHỈ FEED ĐƯỢC CENTER
          px: 1,
        }}
      >
        {children}
      </Box>

      {/* RIGHT SIDEBAR */}
      <RightBar />
    </Box>
  );
}
