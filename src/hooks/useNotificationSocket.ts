"use client";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef } from "react";

export function useNotificationSocket(
  token: string | undefined,
  onReceive: (data: any) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔔 Notification socket connected", socket.id);
    });

    socket.on("notification", (data) => {
      onReceive(data);
    });

    socket.on("disconnect", () => {
      console.log("🔕 Notification socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);
}
