// app/(user)/profile/[id]/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileDetail from "@/components/profile/profile.detail";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

const ProfilePage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const session = await getServerSession(authOptions);
  console.log(slug);

  const data = await sendRequest<IBackendRes<IUser>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${slug}`,
    method: "GET",
    headers: { Authorization: `Bearer ${session?.access_token}` },
    nextOption: {
      // cache: "no-store",
      next: { tags: ["fetch-profile-info"] },
    },
  });

  const res = await sendRequest<IBackendRes<IModelPaginate<IPost>>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/user/${slug}`,
    method: "GET",
    queryParams: { current: 1, pageSize: 20, sort: "-createdAt" },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });

  return (
    <ProfileDetail
      userId={slug}
      users={data.data ?? null}
      posts={res?.data?.result ?? null}
    />
  );
};
export default ProfilePage;
