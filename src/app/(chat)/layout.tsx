// app/(chat)/layout.tsx
import AppHeader from "@/components/header/app.header";
import { Box, Stack } from "@mui/material";
import SideBar from "@/app/(user)/sidebar"; // hoặc từ components nếu bạn đã tách

export default function ChatLayout({
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
        {/* LEFT: SIDEBAR 20% */}
        <Box sx={{ flexBasis: "20%", flexShrink: 0 }}>
          <SideBar />
        </Box>

        {/* CENTER: CHAT 80% (không có RightBar) */}
        <Box sx={{ flexBasis: "77%" }}>{children}</Box>
      </Stack>
    </>
  );
}
