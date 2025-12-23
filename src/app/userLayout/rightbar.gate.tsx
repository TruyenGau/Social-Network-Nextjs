"use client";

import { usePathname } from "next/navigation";
import RightBar from "@/app/(user)/rightbar";

export default function RightBarGate() {
  const pathname = usePathname();

  const isCommunityPage = pathname.startsWith("/community");

  if (isCommunityPage) return null;

  return <RightBar />;
}
