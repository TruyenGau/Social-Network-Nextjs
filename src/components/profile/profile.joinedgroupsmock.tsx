import { sendRequest } from "@/utils/api";
import { Box, Typography, Avatar, Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const JoinedGroupsMock = () => {
  const [joinedGroups, setJoinedGroups] = useState<IGroups[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!session?.access_token) return;

    const fetchJoinedGroups = async () => {
      setLoadingGroups(true);

      const res = await sendRequest<IBackendRes<IModelPaginate<IGroups>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities`,
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const groups = res?.data?.result ?? [];

      // ✅ chỉ lấy nhóm đã tham gia
      const joined = groups.filter((g) => g.isJoined);

      setJoinedGroups(joined);
      setLoadingGroups(false);
    };

    fetchJoinedGroups();
  }, [session?.access_token]);

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
      {loadingGroups ? (
        <Typography fontSize={13} color="#65676B">
          Đang tải nhóm...
        </Typography>
      ) : joinedGroups.length === 0 ? (
        <Typography fontSize={13} color="#65676B">
          Chưa tham gia nhóm nào
        </Typography>
      ) : (
        <Stack spacing={1.2}>
          {joinedGroups.slice(0, 3).map((group) => (
            <Box
              key={group._id}
              display="flex"
              alignItems="center"
              gap={1.5}
              sx={{
                cursor: "pointer",
                "&:hover": { bgcolor: "#e4e6eb" },
                p: 0.8,
                borderRadius: 2,
              }}
              onClick={() => router.push(`/groups/${group._id}`)}
            >
              <Avatar
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${group.avatar}`}
                sx={{ width: 36, height: 36 }}
              />

              <Box>
                <Typography fontSize={14} fontWeight={600}>
                  {group.name}
                </Typography>
                <Typography fontSize={12} color="#65676B">
                  {group.membersCount} thành viên
                </Typography>
              </Box>
            </Box>
          ))}

          {joinedGroups.length > 3 && (
            <Typography
              fontSize={14}
              color="#1877F2"
              fontWeight={600}
              sx={{ cursor: "pointer", mt: 0.5 }}
              onClick={() => router.push(`/groups?joined=true`)}
            >
              Xem tất cả →
            </Typography>
          )}
        </Stack>
      )}

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
