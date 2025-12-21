import { Box } from "@mui/material";
import PostList from "@/components/community/postlist";
import GroupList from "@/components/community/grouplist";
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


const Community = async () => {
  const session = await getServerSession(authOptions);
  const groups = await sendRequest<IBackendRes<IModelPaginate<IGroups>>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities`,
    method: "GET",
    headers: { Authorization: `Bearer ${session?.access_token}` },
    nextOption: {
      next: { tags: ["fetch-groups"] },
    },
  });
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: 3,
      }}
    >
      {/* KHUNG TỔNG */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* FEED - CHÍNH GIỮA */}
        <Box
          sx={{
            width: 650, // chuẩn FB feed
          }}
        >
          <PostList />
        </Box>

        {/* GROUP LIST - MÉP PHẢI */}
        <Box
          sx={{
            width: 330,
            position: "fixed", // 👈 MẤU CHỐT
            right: 24,
            top: 90,
          }}
        >
          <GroupList groups={groups.data?.result ?? null} />
        </Box>
      </Box>
    </Box>
  );
};

export default Community;
