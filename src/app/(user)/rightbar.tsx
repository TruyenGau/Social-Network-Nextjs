import Rightbar from "@/components/rightbar/rightbar";
import { sendRequest } from "@/utils/api";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const RightBar = async () => {
  const session = await getServerSession(authOptions);
  const getSuggestionsFriend = await sendRequest<IBackendRes<IFriend[]>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/suggestions`,
    method: "GET",
    headers: { Authorization: `Bearer ${session?.access_token}` },
    nextOption: {
      next: { tags: ["fetch-sug"] },
    },
  });

  return <Rightbar suggesionFriend={getSuggestionsFriend.data || null} />;
};
export default RightBar;
