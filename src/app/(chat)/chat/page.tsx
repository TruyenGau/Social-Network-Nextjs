// app/(user)/chat/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ChatPageClient from "@/components/chat/ChatPageClient";

const ChatPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any)._id;

  return (
    <>
      <ChatPageClient
        accessToken={session.access_token as string}
        userId={userId}
      />
    </>
  );
};

export default ChatPage;
