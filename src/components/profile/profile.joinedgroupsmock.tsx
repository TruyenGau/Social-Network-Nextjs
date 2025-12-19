import { Box, Typography, Avatar, Stack } from "@mui/material";

const JoinedGroupsMock = () => {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        backgroundColor: "#f7f8fa",
        border: "1px solid #e4e6eb",
      }}
    >
      {/* TITLE */}
      <Typography fontSize={15} fontWeight={700} mb={1}>
        Nhóm đã tham gia
      </Typography>

      {/* GROUP LIST */}
      <Stack spacing={1.5}>
        {[
          { name: "Nhóm CNTT", icon: "👨‍💻", members: "1.2K" },
          { name: "TigerStudy", icon: "🐯", members: "856" },
          { name: "Học React", icon: "⚛️", members: "432" },
        ].map((group) => (
          <Box
            key={group.name}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#e4e6eb" },
              p: 0.8,
              borderRadius: 2,
            }}
          >
            <Avatar sx={{ width: 34, height: 34 }}>{group.icon}</Avatar>

            <Box>
              <Typography fontSize={14} fontWeight={600}>
                {group.name}
              </Typography>
              <Typography fontSize={12} color="text.secondary">
                {group.members} thành viên
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* FOOTER */}
      <Typography
        fontSize={13}
        color="#1877F2"
        sx={{ mt: 1.5, cursor: "pointer", fontWeight: 600 }}
      >
        Xem tất cả →
      </Typography>
    </Box>
  );
};

export default JoinedGroupsMock;
