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
          maxWidth: { xs: "100%", sm: 760, md: 960, lg: 1100, xl: 1200 },
          mx: "auto", // 👈 CHỈ FEED ĐƯỢC CENTER
          px: { xs: 1, sm: 2 },
          // reserve space for fixed sidebars at larger breakpoints using margins so the feed stays centered
          ml: { md: "260px", lg: "300px", xl: "320px" },
          mr: { lg: "320px", xl: "360px" },
        }}
      >
        {children}
      </Box>

      {/* RIGHT SIDEBAR */}
      <RightBar />
    </Box>
  );
}
