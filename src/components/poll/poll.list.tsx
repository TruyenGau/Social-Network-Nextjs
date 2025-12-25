"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import PollCard from "./poll.card";

export default function PollList({ groupId }: { groupId: string }) {
  const { data: session } = useSession();
  const [polls, setPolls] = useState<IPollPublic[]>([]);

  const fetchPolls = async () => {
    const res = await sendRequest<IBackendRes<IPollPublic[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/polls/community/${groupId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    setPolls(res.data ?? []);
  };

  useEffect(() => {
    if (session) fetchPolls();
  }, [session]);

  return (
    <>
      {polls.map((poll) => (
        <PollCard key={poll._id} poll={poll} />
      ))}
    </>
  );
}
