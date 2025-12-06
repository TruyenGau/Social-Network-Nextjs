"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, Stack } from "@mui/material";
import StoryViewer from "./story.view";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import CreateStoryModal from "./story.create.modal";

export default function StoryList() {
  const { data: session } = useSession();

  const [stories, setStories] = useState<IStory[]>([]);
  const [openViewer, setOpenViewer] = useState(false);
  const [selectedStory, setSelectedStory] = useState<IStory | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // ============================================
  // FETCH STORY (tách ra thành function riêng)
  // ============================================
  const fetchStories = async () => {
    if (!session?.access_token) return;

    const res = await sendRequest<IBackendRes<IStory[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/stories`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const list = res.data || [];

    // Lấy avatar + userName
    const storiesWithUser = await Promise.all(
      list.map(async (story) => {
        const userRes = await sendRequest<IBackendRes<any>>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${story.userId}`,
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        return {
          ...story,
          avatar: userRes.data?.avatar || "/default.png",
          userName: userRes.data?.name || "User",
        };
      })
    );

    setStories(storiesWithUser);
  };

  // Load story khi đăng nhập
  useEffect(() => {
    fetchStories();
  }, [session]);
  useEffect(() => {
    const handler = () => fetchStories();

    window.addEventListener("story-follow-updated", handler);

    return () => {
      window.removeEventListener("story-follow-updated", handler);
    };
  }, []);

  // ============================================
  // STORY VIEWER CLICK
  // ============================================
  const handleOpenStory = (story: IStory) => {
    if (!isDragging.current) {
      setSelectedStory(story);
      setOpenViewer(true);
    }
  };

  // ============================================
  // DRAG SCROLL (giữ nguyên)
  // ============================================
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  return (
    <>
      {/* ====== STORY HORIZONTAL LIST ====== */}
      <Stack
        ref={scrollRef}
        direction="row"
        spacing={2}
        sx={{
          p: 2,
          overflowX: "auto",
          overflowY: "hidden",
          width: "100%",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          cursor: isDragging.current ? "grabbing" : "grab",
          "& > *": { flexShrink: 0 },
          "::-webkit-scrollbar": { display: "none" },
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {/* ===== ADD STORY BUTTON ===== */}
        <Box
          textAlign="center"
          sx={{ width: 70 }}
          onClick={() => setOpenCreate(true)}
        >
          <Avatar
            sx={{
              width: 65,
              height: 65,
              cursor: "pointer",
              bgcolor: "#f0f0f0",
              fontSize: 36,
            }}
          >
            +
          </Avatar>
          <Typography fontSize={12} mt={0.5}>
            Add Story
          </Typography>
        </Box>

        {/* ===== STORY ITEMS ===== */}
        {stories.map((story) => (
          <Box
            key={story._id}
            textAlign="center"
            sx={{ width: 70 }}
            onClick={() => handleOpenStory(story)}
          >
            <Avatar
              src={
                story.image
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/images/${story.image}`
                  : "/user/default-user.png"
              }
              sx={{
                width: 65,
                height: 65,
                border: "2px solid #4c74ff",
                cursor: "pointer",
              }}
            />
            <Typography fontSize={12} mt={0.5}>
              {story.userName}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* ===== STORY VIEWER ===== */}
      {openViewer && selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setOpenViewer(false)}
        />
      )}

      {/* ===== CREATE STORY MODAL ===== */}
      {openCreate && (
        <CreateStoryModal
          onClose={() => setOpenCreate(false)}
          onCreated={() => {
            fetchStories();
            setOpenCreate(false);
          }}
        />
      )}
    </>
  );
}
