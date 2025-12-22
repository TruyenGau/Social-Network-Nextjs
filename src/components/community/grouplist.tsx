"use client";

import { Box, Typography, Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateGroupModal from "./create.community.modal";

interface IProps {
  groups: IGroups[] | null;
  compact?: boolean; // when true render for drawer/mobile (no sticky behavior)
}

const GroupList = ({ groups, compact = false }: IProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- TÁCH NHÓM ĐÃ THAM GIA & CHƯA THAM GIA ---
  const joinedGroups = groups?.filter((g) => g.isJoined) ?? [];
  const notJoinedGroups = groups?.filter((g) => !g.isJoined) ?? [];

  return (
    <>
      <CreateGroupModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Box
        sx={{
          position: compact ? "relative" : "sticky",
          top: compact ? "auto" : 80,
          maxHeight: compact ? "none" : "calc(100vh - 100px)",
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "10px",
          },
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={2} sx={{ display: { xs: "none", sm: "block" } }}>
          Nhóm
        </Typography>
        {/* on compact drawer view we show a small header so users know what this panel is */}
        {compact && (
          <Typography variant="subtitle1" fontWeight={700} mb={1} sx={{ display: { xs: "block", sm: "none" } }}>
            Nhóm của bạn
          </Typography>
        )}

        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: "8px 12px",
            background: "#f0f2f5",
            borderRadius: "20px",
            mb: 2,
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: "#65676b" }} />
          <input
            placeholder="Tìm kiếm nhóm"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              fontSize: "14px",
            }}
          />
        </Box>

        {/* CREATE GROUP BUTTON */}
        <Box
          sx={{
            background: "#e7f3ff",
            color: "#1877f2",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: 600,
            cursor: "pointer",
            mb: 3,
            "&:hover": { background: "#d8e9ff" },
          }}
          onClick={() => setIsModalOpen(true)}
        >
          + Tạo nhóm mới
        </Box>

        {/* ============================
            NHÓM ĐÃ THAM GIA
        ============================ */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Nhóm bạn đã tham gia
          </Typography>
          <Typography
            sx={{ color: "#1877f2", fontSize: "14px", cursor: "pointer" }}
          >
            Xem tất cả
          </Typography>
        </Box>

        {joinedGroups.length === 0 && (
          <Typography sx={{ fontSize: "14px", color: "gray", mb: 2 }}>
            Bạn chưa tham gia nhóm nào.
          </Typography>
        )}

        {joinedGroups.map((g) => (
          <GroupItem key={g._id} g={g} router={router} />
        ))}

        {/* ============================
            NHÓM CHƯA THAM GIA
        ============================ */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Gợi ý nhóm cho bạn
        </Typography>

        {notJoinedGroups.length === 0 && (
          <Typography sx={{ fontSize: "14px", color: "gray", mb: 2 }}>
            Không còn nhóm nào để tham gia.
          </Typography>
        )}

        {notJoinedGroups.map((g) => (
          <GroupItem key={g._id} g={g} router={router} />
        ))}
      </Box>
    </>
  );
};

const GroupItem = ({ g, router }: any) => (
  <Box
    onClick={() => router.push(`/community/${g._id}`)}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: 2,
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      "&:hover": { background: "#f0f2f5" },
    }}
  >
    <Avatar
      variant="rounded"
      src={g.avatar}
      sx={{ width: 45, height: 45, borderRadius: "8px" }}
    />
    <Box>
      <Typography fontWeight={600}>{g.name}</Typography>
      <Typography fontSize="13px" color="text.secondary">
        Mô tả: {g.description}
      </Typography>
    </Box>
  </Box>
);

export default GroupList;
