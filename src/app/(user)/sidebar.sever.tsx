import Sidebar from "@/components/sidebar/sidebar";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const SideBarSever = async () => {
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
  return <Sidebar data={data.data ?? null} />;
};
export default SideBarSever;
