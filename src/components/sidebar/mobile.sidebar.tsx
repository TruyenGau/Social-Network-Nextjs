"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import SidebarContent from "./sidebar.content";
import { IUser } from "@/types/next-auth";

interface Props {
  onClose?: () => void;
}

export default function MobileSidebar({ onClose }: Props) {
  const { data: session } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await sendRequest<IBackendRes<IUser>>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${session.user._id}`,
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
          nextOption: { cache: "no-store" },
        });
        setUser(res.data ?? null);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [session?.access_token]);

  if (loading)
    return (
      <Box sx={{ p: 2, width: 260, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={22} />
      </Box>
    );

  return (
    <Box sx={{ p: 1, width: { xs: "100%", sm: 260 } }}>
      <SidebarContent data={user} onNavigate={onClose} />
    </Box>
  );
}
