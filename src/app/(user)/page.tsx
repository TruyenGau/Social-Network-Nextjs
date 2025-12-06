import { Box } from "@mui/material";
import Post from "@/components/post/main";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { sendRequest } from "@/utils/api";
import PostForm from "@/components/post/createPost";
import { IUser } from "@/types/next-auth";
import StoryList from "@/components/story/story.list";

const HomePage = async ({
  searchParams,
}: {
  searchParams: { post?: string };
}) => {
  const session = await getServerSession(authOptions);
  const data = await sendRequest<IBackendRes<IUser>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${session?.user._id}`,
    method: "GET",
    headers: { Authorization: `Bearer ${session?.access_token}` },
    nextOption: {
      // cache: "no-store",
      next: { tags: ["fetch-profile-info"] },
    },
  });
  return (
    <Box flex={4} p={6} sx={{ marginTop: "-30px", marginLeft: "20px" }}>
      <Box sx={{ width: "100%", maxWidth: "590px", overflow: "hidden" }}>
        <StoryList />
      </Box>

      <PostForm data={data.data ?? null} />
      <Post session={session} initPostId={searchParams.post ?? ""} />
    </Box>
  );
};

export default HomePage;
