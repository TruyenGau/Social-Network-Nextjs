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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";  
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

interface IFollowItem {
    _id: string;
    follower: string;
    following: {
        _id: string;
        name: string;
        avatar?: string;
    };
}

type RoomType = "private" | "group";

interface IRoom {
    _id: string;
    type: RoomType;
    name?: string;
    members: string[];
}

interface IMessage {
    _id: string;
    room: string;
    sender: {
        _id: string;
        name: string;
        avatar?: string;
    };
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

const ChatPageClient: React.FC<ChatPageClientProps> = ({
    accessToken,
    userId,
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    const [followings, setFollowings] = useState<IFollowItem[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(true);

    const [currentFriend, setCurrentFriend] = useState<IFollowItem["following"] | null>(null);

    const [currentRoom, setCurrentRoom] = useState<IRoom | null>(null);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesByRoom, setMessagesByRoom] =
        useState<Record<string, IMessage[]>>({});

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
        "😀", "😂", "🤣", "😊", "😍",
        "😘", "😎", "😢", "😭", "😡",
        "👍", "🙏", "💖", "🔥", "👏",
        "🤔", "😴", "😅", "😱", "💩",
    ];


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


        s.on("receive_message", (msg: IMessage) => {
            setMessagesByRoom((prev) => {
                const roomId = msg.room;
                const old = prev[roomId] || [];
                if (old.some((m) => m._id === msg._id)) return prev;
                return { ...prev, [roomId]: [...old, msg] };
            });
        });

        s.on(
            "new_message_notification",
            (payload: { roomId: string; senderId: string; message: IMessage }) => {
                const msg = payload.message;
                const roomId = payload.roomId;

                setMessagesByRoom((prev) => {
                    const old = prev[roomId] || [];
                    if (old.some((m) => m._id === msg._id)) return prev;
                    return { ...prev, [roomId]: [...old, msg] };
                });
            }
        );

        return () => {
            s.disconnect();
        };
    }, [accessToken, BACKEND_URL]);



    // ===== 2. Lấy danh sách following của user để hiển thị ở cột giữa =====
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


    useEffect(() => {
        if (!messagesEndRef.current) return;

        messagesEndRef.current.scrollIntoView({
            behavior: "smooth", 
            block: "end",
        });
    }, [messages.length, currentRoom?._id]);

    // ===== 3. Khi click 1 friend: tạo/tìm room private + load messages =====
    const handleSelectFriend = async (item: IFollowItem) => {
        const friend = item.following;
        setCurrentFriend(friend);

        try {
            const res = await fetch(
                `${BACKEND_URL}/api/v1/chat/create-private`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ otherUserId: friend._id }),
                }
            );

            if (!res.ok) throw new Error("Không tạo được phòng chat");

            const raw = await res.json();
            const room: IRoom = raw.data ?? raw;
            setCurrentRoom(room);

            await fetchMessages(room._id);
        } catch (err) {
            console.error(err);
        }
    };


    // ===== 4. Hàm load messages cho 1 room =====
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


    // ===== 5. Gửi tin nhắn cho friend hiện tại =====
    const handleSend = () => {
        if (!socket || !currentFriend || !input.trim()) return;

        const content = input.trim();

        socket.emit("send_message", {
            receiverId: currentFriend._id,
            content,
            type: "text",
        });

        setInput("");
    };

    const folderType = "post"; 

    const handleSelectMedia = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!socket || !currentFriend) return;

        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("media", file); 

            const res = await fetch(
                `${BACKEND_URL}/api/v1/files/upload-media`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        folder_type: folderType, 
                    },
                    body: formData,
                }
            );

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

            socket.emit("send_message", {
                receiverId: currentFriend._id,
                content: url,
                type,
            });

            e.target.value = "";
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <Box sx={{ p: 2, display: "flex", height: "80vh", gap: 2 }}>
            {/* Cột giữa: DANH SÁCH BẠN BÈ (following) */}
            <Box
                sx={{
                    width: 260,
                    borderRadius: 2,
                    border: "1px solid #eee",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
                    <Typography variant="h6">Bạn bè</Typography>
                </Box>
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    {friendsLoading ? (
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
                                    ? `${BACKEND_URL}/images/${friend.avatar}`
                                    : undefined;


                                return (
                                    <ListItem key={item._id} disablePadding>
                                        <ListItemButton
                                            selected={currentFriend?._id === friend._id}
                                            onClick={() => handleSelectFriend(item)}
                                            sx={{
                                                "&.Mui-selected": {
                                                    bgcolor: "#fce4ec",
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={avatarUrl}>
                                                    {friend.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={friend.name} />
                                        </ListItemButton>
                                    </ListItem>

                                );
                            })}
                        </List>
                    )}
                </Box>
            </Box>

            {/* Cột bên phải: CHAT VỚI FRIEND ĐANG CHỌN */}
            <Box
                sx={{
                    flex: 1,
                    borderRadius: 2,
                    border: "1px solid #eee",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
                    <Typography variant="h6">
                        {currentFriend
                            ? `Chat với ${currentFriend.name}`
                            : "Chọn bạn để bắt đầu chat"}
                    </Typography>
                </Box>

                {/* DANH SÁCH TIN NHẮN */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
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
                    ) : !currentFriend ? (
                        <Typography fontSize={14} color="text.secondary">
                            Hãy chọn một người bạn ở bên trái để bắt đầu cuộc trò chuyện.
                        </Typography>
                    ) : messages.length === 0 ? (
                        <Typography fontSize={14} color="text.secondary">
                            Chưa có tin nhắn nào.
                        </Typography>
                    ) : (
                        <>
                            {messages.map((msg) => {
                                const senderId =
                                    typeof msg.sender === "string" ? msg.sender : msg.sender._id;
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
                                                bgcolor: isMe ? "#e1f5fe" : "#f5f5f5",
                                                borderRadius: isMe
                                                    ? "16px 0 16px 16px"
                                                    : "0 16px 16px 16px",
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
                        disabled={!currentFriend}
                    />

                    <IconButton
                        onClick={handleOpenEmoji}
                        disabled={!currentFriend}
                    >
                        <EmojiEmotionsIcon />
                    </IconButton>

                    <Popover
                        open={openEmoji}
                        anchorEl={emojiAnchorEl}
                        onClose={handleCloseEmoji}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                    >
                        <Box sx={{ p: 1, maxWidth: 260, display: "flex", flexWrap: "wrap" }}>
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
                            if (!currentFriend) return;
                            document.getElementById("chat-media-input")?.click();
                        }}
                        disabled={!currentFriend}
                    >
                        <AttachFileIcon />
                    </IconButton>

                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        disabled={!currentFriend}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <IconButton onClick={handleSend} disabled={!currentFriend}>
                        <SendIcon />
                    </IconButton>
                </Box>


            </Box>
        </Box>
    );
};

export default ChatPageClient;
