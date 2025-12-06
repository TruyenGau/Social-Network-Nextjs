import AppHeader from "@/components/header/app.header";
import { Box, Stack } from "@mui/material";
import SideBar from "../(user)/sidebar";
import RightBar from "../(user)/rightbar";

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
        sx={{ mt: 4, px: 2 }}
      >
        <Box sx={{ flexBasis: "20%", flexShrink: 0 }}>
          <SideBar />
        </Box>
        <Box sx={{ flexBasis: "50%" }}>{children}</Box>
        <Box sx={{ flexBasis: "30%", flexShrink: 0 }}>
          <RightBar />
        </Box>
      </Stack>
    </>
  );
}
