"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Avatar, Button, Card } from "@mui/material";
import CreatePost from "./create.post.group";
import { IUser } from "@/types/next-auth";
import { useHasMounted } from "@/utils/customHook";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import PostListMock from "./postlistmock";

interface IProps {
  groupId: string; // 👉 chỉ nhận ID
  user: IUser | null;
}

const GroupDetailPage = ({ groupId, user }: IProps) => {
  const hasMounted = useHasMounted();
  const router = useRouter();
  const { data: session } = useSession();

  const [group, setGroup] = useState<IGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadPostFlag, setReloadPostFlag] = useState(false);
  const handlePostCreated = () => {
    setReloadPostFlag(!reloadPostFlag); // đổi flag -> PostListMock sẽ refetch
  };

  const route = useRouter();
  const fetchGroup = async () => {
    if (!session) return;

    setLoading(true);

    const res = await sendRequest<IBackendRes<IGroups>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    setGroup(res.data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchGroup();
  }, [session]);

  if (!hasMounted || loading) return <p>Loading...</p>;

  if (!group) return <p>Không tìm thấy nhóm.</p>;

  // ================================
  // JOIN GROUP
  // ================================
  const handleJoin = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/join`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    await sendRequest<IBackendRes<any>>({
      url: "/api/revalidate",
      method: "POST",
      queryParams: {
        tag: "fetch-groups",
        secret: "levantruyen",
      },
    });
    route.refresh();
    if (res.data) {
      fetchGroup(); // 👉 cập nhật UI ngay
    } else {
      alert(res.message);
    }
  };

  const handleLeave = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/leave`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    await sendRequest<IBackendRes<any>>({
      url: "/api/revalidate",
      method: "POST",
      queryParams: {
        tag: "fetch-groups",
        secret: "levantruyen",
      },
    });
    route.refresh();
    if (res.data) {
      fetchGroup(); // 👉 cập nhật UI ngay
    } else {
      alert(res.message);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: "20px",
        display: "flex",
        justifyContent: "center",
        ml: "3%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px",
          display: "flex",
          flexDirection: "column",
          px: 2,
        }}
      >
        {/* COVER */}
        <Box
          sx={{
            width: "100%",
            height: "300px",
            borderRadius: "12px",
            overflow: "hidden",
            mb: 2,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${group.coverPhoto}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        {/* HEADER */}
        <Box sx={{ width: "100%", mb: 3, position: "relative" }}>
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${group.avatar}`}
            sx={{
              width: 120,
              height: 120,
              border: "4px solid white",
              position: "absolute",
              top: -60,
              left: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 3,
            }}
          />

          <Box sx={{ height: 70 }} />

          <Typography variant="h4" fontWeight={700}>
            {group.name}
          </Typography>

          <Typography color="gray" sx={{ mt: 0.5 }}>
            👥 {group.membersCount} thành viên · 📝 {group.postsCount} bài viết
          </Typography>

          {/* Members */}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {group.members.slice(0, 10).map((m, i) => (
              <Avatar
                key={i}
                src={m.avatar}
                sx={{ width: 34, height: 34, border: "2px solid white" }}
              />
            ))}
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {group.isJoined ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleLeave}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Rời nhóm
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleJoin}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Tham gia nhóm
              </Button>
            )}

            <Button variant="contained" sx={{ ml: 1 }}>
              + Mời
            </Button>
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              mt: 3,
              borderBottom: "1px solid #eee",
              pb: 1,
            }}
          >
            {["Thảo luận", "Đáng chú ý", "Thành viên", "Sự kiện", "File"].map(
              (tab, index) => (
                <Typography
                  key={index}
                  sx={{
                    cursor: "pointer",
                    fontWeight: index === 0 ? 700 : 500,
                    borderBottom: index === 0 ? "3px solid #1877f2" : "",
                    color: index === 0 ? "#1877f2" : "#333",
                  }}
                >
                  {tab}
                </Typography>
              )
            )}
          </Box>
        </Box>

        {/* BODY */}
        <Box sx={{ display: "flex", width: "100%", gap: 4 }}>
          <Box sx={{ width: "750px" }}>
            <CreatePost
              data={user}
              groupId={groupId}
              onPostCreated={handlePostCreated}
            />
            <PostListMock groupId={groupId} reloadFlag={reloadPostFlag} />
          </Box>

          <Box sx={{ width: "330px", position: "sticky", top: 90 }}>
            <Card sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Giới thiệu
              </Typography>
              <Typography sx={{ mt: 1, fontSize: "14px", color: "#444" }}>
                {group.description || "Chưa có mô tả nhóm."}
              </Typography>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GroupDetailPage;
