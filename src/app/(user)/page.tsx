import { Box } from "@mui/material";
import Post from "@/components/post/main";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { sendRequest } from "@/utils/api";
import PostForm from "@/components/post/createPost";
import { IUser } from "@/types/next-auth";
import StoryList from "@/components/story/story.list";
import { redirect } from "next/navigation";

const HomePage = async ({
  searchParams,
}: {
  searchParams: { post?: string };
}) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }
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
    <Box
      sx={{
        width: "100%",
        p: 0, // ❌ bỏ p={6}
        m: 0, // ❌ bỏ margin lệch
      }}
    >
      {/* STORY */}
      <Box sx={{ width: "100%", mb: 2 }}>
        <StoryList />
      </Box>

      {/* POST FORM */}
      <PostForm data={data.data ?? null} />

      {/* POST LIST */}
      <Post session={session} initPostId={searchParams.post ?? ""} />
    </Box>
  );
};

export default HomePage;
