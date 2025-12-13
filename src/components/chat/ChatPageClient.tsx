"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Popover,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useSearchParams } from "next/navigation";

interface IFollowItem {
  _id: string;
  follower: string;
  following: {
    _id: string;
    name: string;
    avatar?: string;
    online?: boolean;
  };
}

type RoomType = "private" | "group";

interface IRoomMember {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface IRoom {
  _id: string;
  type: RoomType;
  name?: string;
  members: IRoomMember[];
}

interface IMessage {
  _id: string;
  room: string;
  sender: { _id: string; name: string; avatar?: string };
  type: "text" | "image" | "video";
  content: string;
  createdAt: string;
}

interface IBackendRes<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface ChatPageClientProps {
  accessToken: string;
  userId: string;
}

interface IPendingRequest {
  roomId: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
    online?: boolean;
  };
  lastMessage: string;
  createdAt: string;
}

const getRoomIdFromMessage = (msg: any): string => {
  if (!msg) return "";
  if (typeof msg.room === "string") return msg.room;
  if (msg.room && typeof msg.room === "object" && msg.room._id) {
    return msg.room._id;
  }
  return "";
};

const ChatPageClient: React.FC<ChatPageClientProps> = ({
  accessToken,
  userId,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [followings, setFollowings] = useState<IFollowItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const [currentFriend, setCurrentFriend] = useState<
    IFollowItem["following"] | null
  >(null);

  const [currentRoom, setCurrentRoom] = useState<IRoom | null>(null);

  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");

  const [groups, setGroups] = useState<IRoom[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>(
    []
  );
  const [groupName, setGroupName] = useState("");
  const [createGroupLoading, setCreateGroupLoading] = useState(false);

  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");
  const initialRoomId = searchParams.get("roomId");
  const initialRoomType = searchParams.get("type");

  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesByRoom, setMessagesByRoom] = useState<
    Record<string, IMessage[]>
  >({});

  const messages = currentRoom ? messagesByRoom[currentRoom._id] || [] : [];

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [input, setInput] = useState("");

  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLElement | null>(null);
  const openEmoji = Boolean(emojiAnchorEl);

  const handleOpenEmoji = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(event.currentTarget);
  };
  const handleCloseEmoji = () => {
    setEmojiAnchorEl(null);
  };

  const emojis = [
    "😀",
    "😂",
    "🤣",
    "😊",
    "😍",
    "😘",
    "😎",
    "😢",
    "😭",
    "😡",
    "👍",
    "🙏",
    "💖",
    "🔥",
    "👏",
    "🤔",
    "😴",
    "😅",
    "😱",
    "💩",
  ];

  const [pendingRequests, setPendingRequests] = useState<IPendingRequest[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  // --- Dialog xử lý tin nhắn chờ ---
  const [selectedPending, setSelectedPending] =
    useState<IPendingRequest | null>(null);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [pendingActionLoading, setPendingActionLoading] = useState(false);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:6969";

  // ===== 1. Kết nối socket =====
  useEffect(() => {
    if (!accessToken) return;
    const s = io(`${BACKEND_URL}/chat`, {
      auth: { token: `Bearer ${accessToken}` },
    });
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected", s.id);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    s.on("receive_message", (msg: IMessage | any) => {
      setMessagesByRoom((prev) => {
        const roomId = getRoomIdFromMessage(msg);
        if (!roomId) return prev;
        const old = prev[roomId] || [];
        if (old.some((m) => m._id === msg._id)) return prev;
        return { ...prev, [roomId]: [...old, msg] };
      });
    });

    s.on("receive_group_message", (msg: IMessage | any) => {
      setMessagesByRoom((prev) => {
        const roomId = getRoomIdFromMessage(msg);
        if (!roomId) return prev;
        const old = prev[roomId] || [];
        if (old.some((m) => m._id === msg._id)) return prev;
        return { ...prev, [roomId]: [...old, msg] };
      });
    });

    return () => {
      s.disconnect();
    };
  }, [accessToken, BACKEND_URL]);

  const prevRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socket || !currentRoom) return;

    // leave room cũ
    if (prevRoomIdRef.current) {
      socket.emit("leave_room", { roomId: prevRoomIdRef.current });
    }

    // join room mới
    if (currentRoom.type === "private") {
      socket.emit("join_private", { roomId: currentRoom._id });
    }

    if (currentRoom.type === "group") {
      socket.emit("join_group", { roomId: currentRoom._id });
    }

    prevRoomIdRef.current = currentRoom._id;

    return () => {
      if (prevRoomIdRef.current) {
        socket.emit("leave_room", { roomId: prevRoomIdRef.current });
        prevRoomIdRef.current = null;
      }
    };
  }, [currentRoom?._id]);

  // ===== 2. Lấy danh sách followings =====
  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        setFriendsLoading(true);

        const res = await fetch(
          `${BACKEND_URL}/api/v1/follow/following/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) throw new Error("Không lấy được danh sách following");

        const json: IBackendRes<IFollowItem[]> = await res.json();
        setFollowings(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFriendsLoading(false);
      }
    };

    if (userId && accessToken) fetchFollowings();
  }, [userId, accessToken, BACKEND_URL]);

  // ===== POLLING ONLINE STATUS (BẮT BUỘC) =====
  useEffect(() => {
    if (!accessToken || !userId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/v1/follow/following/${userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!res.ok) return;

        const json: IBackendRes<IFollowItem[]> = await res.json();

        // 🔥 chỉ update online, KHÔNG replace toàn bộ object
        setFollowings((prev) =>
          prev.map((f) => {
            const updated = json.data.find(
              (x) => x.following._id === f.following._id
            );
            return updated
              ? {
                  ...f,
                  following: {
                    ...f.following,
                    online: updated.following.online,
                  },
                }
              : f;
          })
        );
      } catch {}
    }, 5000); // 5s là hợp lý

    return () => clearInterval(interval);
  }, [accessToken, userId, BACKEND_URL]);

  // ===== Lấy danh sách TIN NHẮN CHỜ =====
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setPendingLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/chat/pending`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Không lấy được tin nhắn chờ");

        const json: IBackendRes<IPendingRequest[]> = await res.json();
        setPendingRequests(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPendingLoading(false);
      }
    };

    if (userId && accessToken) {
      fetchPendingRequests();
    }
  }, [userId, accessToken, BACKEND_URL]);

  // ===== SYNC currentFriend ONLINE STATUS =====
  useEffect(() => {
    if (!currentFriend) return;

    const updated = followings.find(
      (f) => f.following._id === currentFriend._id
    );

    if (updated) {
      setCurrentFriend((prev) =>
        prev
          ? {
              ...prev,
              online: updated.following.online,
            }
          : prev
      );
    }
  }, [followings]);

  // TỰ ĐỘNG MỞ CHAT RIÊNG KHI CÓ ?userId=...
  useEffect(() => {
    if (!initialUserId) return;
    if (!socket) return;
    if (followings.length === 0) return;

    const item = followings.find((f) => f.following._id === initialUserId);

    if (item) {
      handleSelectFriend(item);
    }
  }, [initialUserId, socket, followings]);

  // ===== Lấy danh sách nhóm chat =====
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setGroupsLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/chat/rooms`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error("Không lấy được danh sách phòng chat");

        const json: IBackendRes<any[]> = await res.json();
        const roomsRaw = json.data || [];
        console.log("rooms from API:", roomsRaw);

        const groupRooms: IRoom[] = roomsRaw
          .filter(
            (r: any) => r.type && r.type.toString().toLowerCase() === "group"
          )
          .map((r: any) => ({
            _id: r._id,
            type: r.type as RoomType,
            name: r.name,
            members: r.members || [],
          }));

        setGroups(groupRooms);
      } catch (err) {
        console.error(err);
      } finally {
        setGroupsLoading(false);
      }
    };

    if (userId && accessToken) {
      fetchGroups();
    }
  }, [userId, accessToken, BACKEND_URL]);

  // TỰ ĐỘNG MỞ CHAT NHÓM
  useEffect(() => {
    if (!initialRoomId) return;
    if (initialRoomType !== "group") return;
    if (!socket) return;
    if (groups.length === 0) return;

    const room = groups.find((g) => g._id === initialRoomId);
    if (room) {
      handleSelectGroup(room);
    }
  }, [initialRoomId, initialRoomType, socket, groups]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, currentRoom?._id]);

  // ===== Chọn bạn → tạo/tìm room private =====
  const handleSelectFriend = async (item: IFollowItem) => {
    // 🔥 LEAVE ROOM CŨ

    const friend = item.following;
    setCurrentFriend(friend);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/chat/create-private`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ otherUserId: friend._id }),
      });

      if (!res.ok) throw new Error("Không tạo được phòng chat");

      const raw = await res.json();
      const room: IRoom = raw.data ?? raw;

      setCurrentRoom(room);

      // 🔥 JOIN ROOM PRIVATE (BẮT BUỘC)

      await fetchMessages(room._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Khi click 1 "tin nhắn chờ": mở chat riêng với người gửi
  const handleOpenPendingChat = async (req: IPendingRequest) => {
    const user = req.sender;
    setCurrentFriend(user); // cho khung chat biết đang chat với ai

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/chat/create-private`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ otherUserId: user._id }),
      });

      if (!res.ok) throw new Error("Không tạo được phòng chat");

      const raw = await res.json();
      const room: IRoom = raw.data ?? raw;

      setCurrentRoom(room);

      // 🔥 JOIN ROOM PRIVATE

      await fetchMessages(room._id);
    } catch (err) {
      console.error(err);
    }
  };

  // CHẤP NHẬN TIN NHẮN CHỜ
  const handleAcceptPending = async () => {
    if (!selectedPending) return;

    try {
      // 1. Gọi API accept pending
      const res = await fetch(
        `${BACKEND_URL}/api/v1/chat/pending/${selectedPending.roomId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Không chấp nhận được tin nhắn");

      // 2. (Tuỳ chọn) tự động follow người gửi
      await fetch(
        `${BACKEND_URL}/api/v1/follow/${selectedPending.sender._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ).catch(() => {});

      // 3. Xoá khỏi danh sách tin nhắn chờ
      setPendingRequests((prev) =>
        prev.filter((p) => p.roomId !== selectedPending.roomId)
      );

      // 4. Mở luôn khung chat với người đó
      const room: IRoom = {
        _id: selectedPending.roomId,
        type: "private",
        name: undefined,
        members: [
          { _id: userId, email: "", name: "" },
          {
            _id: selectedPending.sender._id,
            email: "",
            name: selectedPending.sender.name,
            avatar: selectedPending.sender.avatar,
          },
        ],
      };

      setCurrentFriend({
        _id: selectedPending.sender._id,
        name: selectedPending.sender.name,
        avatar: selectedPending.sender.avatar,
      });

      setCurrentRoom(room);
      await fetchMessages(selectedPending.roomId); // dùng lại hàm bạn đã viết
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDialogOpen(false);
      setSelectedPending(null);
    }
  };

  // XOÁ TIN NHẮN CHỜ
  const handleRejectPending = async () => {
    if (!selectedPending) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/chat/pending/${selectedPending.roomId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Không xoá được tin nhắn chờ");

      setPendingRequests((prev) =>
        prev.filter((p) => p.roomId !== selectedPending.roomId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDialogOpen(false);
      setSelectedPending(null);
    }
  };

  // ===== Chọn group =====
  const handleSelectGroup = async (room: IRoom) => {
    // 🔥 LEAVE ROOM CŨ

    setCurrentFriend(null);
    setCurrentRoom(room);

    try {
      if (socket) {
      }
      await fetchMessages(room._id);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectMember = (friendId: string) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    if (selectedGroupMembers.length === 0) return;

    try {
      setCreateGroupLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/v1/chat/create-group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: groupName.trim(),
          memberIds: selectedGroupMembers,
        }),
      });

      if (!res.ok) throw new Error("Tạo nhóm thất bại");

      const json: IBackendRes<IRoom> = await res.json();
      const room = json.data ?? json;

      setGroups((prev) => [room, ...prev]);

      setCreateGroupOpen(false);
      setSelectedGroupMembers([]);
      setGroupName("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreateGroupLoading(false);
    }
  };

  // ===== 4. Load tin nhắn
  const fetchMessages = async (roomId: string) => {
    try {
      setMessagesLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/v1/chat/messages/${roomId}?page=1&limit=30`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được tin nhắn");

      const json: IBackendRes<IMessage[]> = await res.json();
      const list = json.data || [];

      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: list,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // ===== 5. Gửi tin nhắn
  const handleSend = () => {
    if (!socket || !currentRoom || !input.trim()) return;

    const content = input.trim();

    if (currentRoom.type === "private") {
      if (!currentFriend) return;

      socket.emit("send_message", {
        receiverId: currentFriend._id,
        content,
        type: "text",
      });
    } else if (currentRoom.type === "group") {
      socket.emit("send_group_message", {
        roomId: currentRoom._id,
        content,
        type: "text",
      });
    }

    setInput("");
  };

  const folderType = "post";

  const handleSelectMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket || !currentRoom) return;

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("media", file);

      const res = await fetch(`${BACKEND_URL}/api/v1/files/upload-media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          folder_type: folderType,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload media thất bại");

      const json = await res.json();
      const data = json.data ?? json;

      let type: "image" | "video" | null = null;
      let filename: string | null = null;

      if (data.images && data.images.length > 0) {
        type = "image";
        filename = data.images[0];
      } else if (data.videos && data.videos.length > 0) {
        type = "video";
        filename = data.videos[0];
      }

      if (!type || !filename) return;

      const url =
        type === "image"
          ? `${BACKEND_URL}/post/images/${filename}`
          : `${BACKEND_URL}/post/videos/${filename}`;

      if (currentRoom.type === "private") {
        if (!currentFriend) return;

        socket.emit("send_message", {
          receiverId: currentFriend._id,
          content: url,
          type,
        });
      } else if (currentRoom.type === "group") {
        socket.emit("send_group_message", {
          roomId: currentRoom._id,
          content: url,
          type,
        });
      }

      e.target.value = "";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Box sx={{ p: 2, display: "flex", height: "80vh", gap: 8 }}>
        {/* CỘT GIỮA: KHUNG CHAT */}
        <Box
          sx={{
            flex: 0.9,
            borderRadius: 2,
            border: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#fafafa", // nền xám nhạt
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #eee",
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* TRƯỜNG HỢP CHƯA CHỌN ROOM */}
            {!currentRoom && (
              <Typography variant="h6">
                Chọn bạn hoặc nhóm để bắt đầu chat
              </Typography>
            )}

            {/* TRÒ CHUYỆN RIÊNG */}
            {currentRoom && currentRoom.type === "private" && currentFriend && (
              <>
                <Avatar
                  src={
                    currentFriend.avatar
                      ? `${BACKEND_URL}/avatar/images/${currentFriend.avatar}`
                      : undefined
                  }
                  sx={{ width: 36, height: 36 }}
                >
                  {/* {currentFriend.name?.charAt(0).toUpperCase()} */}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{currentFriend.name}</Typography>
                  <Typography
                    fontSize={12}
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.7 }}
                  >
                    {currentFriend.online && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: "#44b700",
                          borderRadius: "50%",
                          boxShadow: "0 0 0 4px rgba(68,183,0,0.25)",
                        }}
                      />
                    )}

                    {currentFriend.online
                      ? "Đang hoạt động"
                      : "Hoạt động 5p trước"}
                  </Typography>
                </Box>
              </>
            )}

            {/* NHÓM CHAT */}
            {currentRoom && currentRoom.type === "group" && (
              <Box>
                <Typography fontWeight={600}>
                  Nhóm: {currentRoom.name || "Không tên"}
                </Typography>
              </Box>
            )}
          </Box>

          {/* DANH SÁCH TIN NHẮN */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {messagesLoading ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : !currentRoom ? (
              <Typography fontSize={14} color="text.secondary">
                Hãy chọn một người bạn hoặc nhóm ở bên trái để bắt đầu cuộc trò
                chuyện.
              </Typography>
            ) : messages.length === 0 ? (
              <Typography fontSize={14} color="text.secondary">
                Chưa có tin nhắn nào.
              </Typography>
            ) : (
              <>
                {messages.map((msg) => {
                  const senderId =
                    typeof msg.sender === "string"
                      ? msg.sender
                      : msg.sender._id;
                  const senderName =
                    typeof msg.sender === "string" ? "" : msg.sender.name;
                  const isMe = senderId === userId;

                  return (
                    <Box
                      key={msg._id}
                      sx={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "70%",
                          px: 1.5,
                          py: 0.75,
                          bgcolor: isMe ? "#e3f2fd" : "#ffffff",
                          borderRadius: isMe
                            ? "16px 0 16px 16px"
                            : "0 16px 16px 16px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      >
                        {!isMe && senderName && (
                          <Typography
                            fontSize={12}
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {senderName}
                          </Typography>
                        )}

                        {msg.type === "image" ? (
                          <Box
                            component="img"
                            src={msg.content}
                            sx={{
                              maxWidth: 260,
                              maxHeight: 260,
                              borderRadius: 2,
                              display: "block",
                            }}
                          />
                        ) : msg.type === "video" ? (
                          <Box
                            component="video"
                            src={msg.content}
                            controls
                            sx={{
                              maxWidth: 260,
                              maxHeight: 260,
                              borderRadius: 2,
                              display: "block",
                            }}
                          />
                        ) : (
                          <Typography fontSize={14}>{msg.content}</Typography>
                        )}

                        <Typography
                          fontSize={10}
                          color="text.disabled"
                          textAlign="right"
                        >
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}

                <Box ref={messagesEndRef} />
              </>
            )}
          </Box>

          {/* Ô NHẬP TIN NHẮN */}
          <Box
            sx={{
              borderTop: "1px solid #eee",
              p: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <input
              id="chat-media-input"
              type="file"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleSelectMedia}
              disabled={!currentRoom}
            />

            <IconButton onClick={handleOpenEmoji} disabled={!currentRoom}>
              <EmojiEmotionsIcon />
            </IconButton>

            <Popover
              open={openEmoji}
              anchorEl={emojiAnchorEl}
              onClose={handleCloseEmoji}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <Box
                sx={{
                  p: 1,
                  maxWidth: 260,
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {emojis.map((emo) => (
                  <IconButton
                    key={emo}
                    onClick={() => {
                      setInput((prev) => prev + emo);
                    }}
                    size="small"
                  >
                    <span style={{ fontSize: 20 }}>{emo}</span>
                  </IconButton>
                ))}
              </Box>
            </Popover>

            <IconButton
              onClick={() => {
                if (!currentRoom) return;
                document.getElementById("chat-media-input")?.click();
              }}
              disabled={!currentRoom}
            >
              <AttachFileIcon />
            </IconButton>

            <TextField
              size="small"
              fullWidth
              placeholder="Nhập tin nhắn..."
              value={input}
              disabled={!currentRoom}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <IconButton onClick={handleSend} disabled={!currentRoom}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>

        {/* CỘT PHẢI: trên = Bạn bè/Nhóm, dưới = Tin nhắn chờ */}
        <Box
          sx={{
            width: 460,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* KHUNG 1: BẠN BÈ / NHÓM CHAT (THU NHỎ CHIỀU CAO) */}
          <Box
            sx={{
              flex: "0 0 60%",
              borderRadius: 2,
              border: "1px solid #eee",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* TAB HEADER */}
            <Box
              sx={{
                p: 1.5,
                borderBottom: "1px solid #eee",
                bgcolor: "#f5f5f5",
                display: "flex",
                gap: 1,
              }}
            >
              <Box
                onClick={() => setActiveTab("friends")}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.5,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  bgcolor:
                    activeTab === "friends" ? "#3683d1ff" : "transparent",
                  color: activeTab === "friends" ? "#fff" : "text.primary",
                }}
              >
                Bạn bè
              </Box>
              <Box
                onClick={() => setActiveTab("groups")}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.5,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  bgcolor: activeTab === "groups" ? "#3683d1ff" : "transparent",
                  color: activeTab === "groups" ? "#fff" : "text.primary",
                }}
              >
                Nhóm chat
              </Box>
            </Box>

            {/* NỘI DUNG CUỘN TRONG KHUNG 1 */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#a8a8a8",
                },
              }}
            >
              {activeTab === "friends" ? (
                friendsLoading ? (
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : followings.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography fontSize={14}>
                      Bạn chưa theo dõi ai cả.
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 0 }}>
                    {followings.map((item) => {
                      const friend = item.following;
                      const avatarUrl = friend.avatar
                        ? `${BACKEND_URL}/avatar/images/${friend.avatar}`
                        : undefined;

                      return (
                        <ListItem key={item._id} disablePadding>
                          <ListItemButton
                            selected={currentFriend?._id === friend._id}
                            onClick={() => handleSelectFriend(item)}
                            sx={{
                              "&.Mui-selected": {
                                bgcolor: "#e3f2fd",
                              },
                              "&:hover": {
                                bgcolor: "#f5f5f5",
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <ListItemAvatar>
                              <Box
                                sx={{
                                  position: "relative",
                                  display: "inline-block",
                                }}
                              >
                                <Avatar src={avatarUrl}>
                                  {friend.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                {friend.online && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      bottom: 0,
                                      right: 0,
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      bgcolor: "#44b700",
                                      border: "2px solid #fff",
                                      boxShadow:
                                        "0 0 0 4px rgba(68,183,0,0.25)",
                                    }}
                                  />
                                )}
                              </Box>
                            </ListItemAvatar>
                            <ListItemText primary={friend.name} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                )
              ) : (
                // TAB NHÓM CHAT TRONG KHUNG 1
                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => {
                        setCreateGroupOpen(true);
                        setSelectedGroupMembers([]);
                        setGroupName("");
                      }}
                      sx={{
                        mb: 2,
                        bgcolor: "#3683d1ff",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "#2f74bc",
                        },
                      }}
                    >
                      + Tạo nhóm
                    </Button>
                  </Box>
                  {groupsLoading ? (
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : groups.length === 0 ? (
                    <Typography fontSize={14} color="text.secondary">
                      Bạn chưa tham gia nhóm nào.
                    </Typography>
                  ) : (
                    <List sx={{ py: 0 }}>
                      {groups.map((g) => (
                        <ListItem key={g._id} disablePadding>
                          <ListItemButton
                            selected={currentRoom?._id === g._id}
                            onClick={() => handleSelectGroup(g)}
                            sx={{
                              "&.Mui-selected": {
                                bgcolor: "#e8f5e9",
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar>
                                {g.name?.charAt(0).toUpperCase() || "G"}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={g.name || "Nhóm không tên"}
                              secondary={`${g.members.length} thành viên`}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* KHUNG 2: TIN NHẮN CHỜ (RIÊNG, NGAY DƯỚI) */}
          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              border: "1px solid #eee",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              bgcolor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 1,
                pb: 1,
                borderBottom: "1px solid #e0e0e0", // đậm hơn #f0f0f0
                bgcolor: "#f2f2f2", // xám đậm hơn #fafafa
              }}
            >
              <Typography fontSize={13} fontWeight={600} color="text.secondary">
                Tin nhắn chờ{" "}
                {pendingRequests.length > 0 && (
                  <span style={{ color: "#d32f2f", fontWeight: 700 }}>
                    ({pendingRequests.length})
                  </span>
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#a8a8a8",
                },
              }}
            >
              {pendingLoading ? (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              ) : pendingRequests.length === 0 ? (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography fontSize={13} color="text.secondary">
                    Không có tin nhắn chờ.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {pendingRequests.map((req) => {
                    const sender = req.sender;
                    const avatarUrl = sender.avatar
                      ? `${BACKEND_URL}/avatar/images/${sender.avatar}`
                      : undefined;

                    return (
                      <ListItem key={req.roomId} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            setSelectedPending(req);
                            setPendingDialogOpen(true);
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={avatarUrl}>
                              {sender.name?.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={sender.name}
                            secondary={
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {req.lastMessage}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Box>
        </Box>

        {/* Dialog tạo nhóm */}
        <Dialog
          open={createGroupOpen}
          onClose={() => {
            if (!createGroupLoading) setCreateGroupOpen(false);
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              pb: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: "center",
              fontWeight: 700,
              fontSize: 20,
              pb: 1,
            }}
          >
            Tạo nhóm chat
          </DialogTitle>

          <DialogContent
            dividers
            sx={{
              px: 4,
              pt: 2,
              pb: 3,
            }}
          >
            <TextField
              label="Tên nhóm"
              fullWidth
              size="small"
              margin="dense"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <Typography
              variant="subtitle2"
              sx={{ mt: 2, mb: 1, fontWeight: 600 }}
            >
              Chọn thành viên:
            </Typography>

            {friendsLoading ? (
              <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={20} />
              </Box>
            ) : followings.length === 0 ? (
              <Typography fontSize={14} color="text.secondary">
                Bạn chưa theo dõi ai nào để thêm vào nhóm.
              </Typography>
            ) : (
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                }}
              >
                {followings.map((item) => {
                  const friend = item.following;
                  const checked = selectedGroupMembers.includes(friend._id);

                  return (
                    <FormControlLabel
                      key={friend._id}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={() => toggleSelectMember(friend._id)}
                        />
                      }
                      label={friend.name}
                    />
                  );
                })}
              </Box>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 4,
              pb: 2,
              pt: 1,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={() => {
                if (!createGroupLoading) setCreateGroupOpen(false);
              }}
              disabled={createGroupLoading}
              sx={{ textTransform: "none" }}
            >
              Hủy
            </Button>

            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={
                createGroupLoading ||
                !groupName.trim() ||
                selectedGroupMembers.length === 0
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              {createGroupLoading ? "Đang tạo..." : "Tạo nhóm"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog xử lý tin nhắn chờ */}
        <Dialog
          open={pendingDialogOpen}
          onClose={() => {
            setPendingDialogOpen(false);
            setSelectedPending(null);
          }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              px: 2,
              pt: 1,
              pb: 2,
              minWidth: 360,
              boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: 18,
              pb: 1,
              textAlign: "center",
            }}
          >
            Tin nhắn chờ
          </DialogTitle>

          <DialogContent
            sx={{
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
              py: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  bgcolor: "#fff3cd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🔒
              </Box>
              <Typography fontSize={14}>
                <b>Bạn chưa theo dõi người này</b>
              </Typography>
            </Box>

            <Typography fontSize={14} color="text.secondary">
              Bạn có muốn:
            </Typography>
          </DialogContent>

          <DialogActions
            sx={{
              pt: 1.5,
              pb: 1,
              px: 1,
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={handleRejectPending}
              color="error"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.30)", // nền đỏ nhạt
                  color: "#b71c1c", // chữ đỏ đậm hơn
                },
              }}
            >
              XÓA
            </Button>

            <Button
              onClick={handleAcceptPending}
              variant="contained"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                px: 3,
              }}
            >
              CHẤP NHẬN TIN NHẮN
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ChatPageClient;
