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
      flex={4}
      p={3}
      sx={{
        // marginTop: "10px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* WRAPPER CHÍNH — GIỐNG FB */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px", // MỞ RỘNG KHUNG TỔNG → ĐẸP VÀ CÂN
          display: "flex",
          gap: 4,
          justifyContent: "center",
          paddingRight: 2,
        }}
      >
        {/* POST FEED ở giữa */}
        <Box
          sx={{
            flexShrink: 0,
            width: "750px", // CHUẨN FACEBOOK FEED
            margin: "0 auto",
          }}
        >
          <PostList />
        </Box>

        {/* GROUP LIST SÁT MÉP PHẢI */}
        <Box
          sx={{
            flexShrink: 0,
            width: "330px",
            position: "sticky",
            top: 90,
            marginLeft: "auto",
          }}
        >
          <GroupList groups={groups.data?.result ?? null} />
        </Box>
      </Box>
    </Box>
  );
};

export default Community;
