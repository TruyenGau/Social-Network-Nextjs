import GroupDetailPage from "@/components/community/groupdetail";
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { IUser } from "@/types/next-auth";
import GroupInfoPanel from "@/components/community/group.info.panel";

const GroupPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  // Lấy user
  const user = await sendRequest<IBackendRes<IUser>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${session?.user._id}`,
    method: "GET",
    headers: { Authorization: `Bearer ${session?.access_token}` },
    nextOption: {
      next: { tags: ["fetch-profile-info"] },
    },
  });

  return (
    <>
      <GroupDetailPage groupId={slug} user={user.data ?? null} />
    </>
  );
};

export default GroupPage;
