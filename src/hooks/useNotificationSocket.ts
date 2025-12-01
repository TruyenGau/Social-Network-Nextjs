"use client";
import { io, Socket } from "socket.io-client";
import { useEffect } from "react";

let socket: Socket | null = null;

export function useNotificationSocket(
  userId: string,
  onReceive: (data: any) => void
) {
  useEffect(() => {
    if (!userId) return;

    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      query: { userId },
      transports: ["websocket"],
    });

    socket.on("notification", (data) => {
      onReceive(data);
    });

    return () => {
      socket?.disconnect();
    };
  }, [userId]);
}
