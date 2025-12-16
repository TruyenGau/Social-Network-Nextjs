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
    <>
      <AppHeader />
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ px: 2, mt: "60px" }}
      >
        <Box sx={{ flexBasis: "20%", flexShrink: 0 }}>
          <SideBarSever />
        </Box>
        <Box sx={{ flexBasis: "50%" }}>{children}</Box>
        <Box sx={{ flexBasis: "30%", flexShrink: 0 }}>
          <RightBar />
        </Box>
      </Stack>
    </>
  );
}
