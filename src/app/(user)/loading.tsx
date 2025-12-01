import { Box, Skeleton, Card, CardHeader, CardContent } from "@mui/material";

export default function LoadingPostList() {
  // Loading giả lập 3 bài post
  const dummyPosts = Array.from({ length: 3 });

  return (
    <Box flex={4} p={2}>
      {dummyPosts.map((_, index) => (
        <Card
          key={index}
          sx={{
            margin: "24px auto",
            maxWidth: 600,
            width: "100%", // 👉 FULL WIDTH
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <CardHeader
            avatar={<Skeleton variant="circular" width={45} height={45} />}
            title={<Skeleton width="40%" height={20} />}
            subheader={<Skeleton width="30%" height={16} />}
          />

          {/* IMAGE PLACEHOLDER */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={450} // 👉 CHO TO HƠN NHƯ ẢNH THẬT
            sx={{ borderRadius: 2 }}
          />

          {/* CONTENT */}
          <CardContent>
            <Skeleton width="60%" height={28} sx={{ mb: 1 }} />
            <Skeleton width="90%" height={20} />
            <Skeleton width="85%" height={20} />
            <Skeleton width="70%" height={20} sx={{ mb: 2 }} />
          </CardContent>

          {/* LIKE / COMMENT / SHARE */}
          <Box sx={{ px: 2, pb: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={60} />
          </Box>
        </Card>
      ))}
    </Box>
  );
}
