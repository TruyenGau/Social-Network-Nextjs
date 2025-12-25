"use client";

import { Box, Typography, Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateGroupModal from "./create.community.modal";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";

interface IProps {
  groups: IGroups[] | null;
  compact?: boolean; // when true render for drawer/mobile (no sticky behavior)
}

const GroupList = ({ groups, compact = false }: IProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ================= SEARCH STATE ================= */
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState<IGroups[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= GROUP SPLIT (OLD LOGIC) ================= */
  const joinedGroups = groups?.filter((g) => g.isJoined) ?? [];
  const notJoinedGroups = groups?.filter((g) => !g.isJoined) ?? [];

  const { data: session } = useSession();
  /* ================= SEARCH EFFECT ================= */
  useEffect(() => {
    if (!searchText || searchText.trim().length < 2) {
      setSearchResult([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await sendRequest<IBackendRes<IGroups[]>>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/search/by-name`,
          headers: { Authorization: `Bearer ${session?.access_token}` },
          method: "GET",
          queryParams: { q: searchText },
        });
        console.log("Search community result:", res);
        setSearchResult(res?.data ?? []);
      } catch (err) {
        console.error("Search community error", err);
        setSearchResult([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

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
        {/* ================= HEADER ================= */}
        <Typography
          variant="h5"
          fontWeight={700}
          mb={2}
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          Nhóm
        </Typography>

        {compact && (
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Nhóm của bạn
          </Typography>
        )}

        {/* ================= SEARCH BOX ================= */}
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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              fontSize: "14px",
            }}
          />
        </Box>

        {/* ================= CREATE GROUP ================= */}
        <Box sx={{ mb: 3 }}>
          <Box
            component="button"
            onClick={() => setIsModalOpen(true)}
            sx={{
              width: "100%",
              background: "#e7f3ff",
              color: "#1877f2",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { background: "#d8e9ff" },
            }}
          >
            + Tạo nhóm mới
          </Box>
        </Box>

        {/* ================= SEARCH RESULT ================= */}
        {searchText.trim().length >= 2 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Kết quả tìm kiếm
            </Typography>

            {loading && (
              <Typography fontSize="14px" color="text.secondary">
                Đang tìm kiếm...
              </Typography>
            )}

            {!loading && searchResult.length === 0 && (
              <Typography fontSize="14px" color="gray">
                Không tìm thấy nhóm phù hợp
              </Typography>
            )}

            {searchResult.map((g) => (
              <GroupItem key={g._id} g={g} router={router} />
            ))}
          </Box>
        )}

        {/* ================= OLD UI (ONLY WHEN NOT SEARCHING) ================= */}
        {searchText.trim().length < 2 && (
          <>
            {/* JOINED GROUPS */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Nhóm bạn đã tham gia
              </Typography>
            </Box>

            {joinedGroups.length === 0 && (
              <Typography fontSize="14px" color="gray" mb={2}>
                Bạn chưa tham gia nhóm nào.
              </Typography>
            )}

            {joinedGroups.map((g) => (
              <GroupItem key={g._id} g={g} router={router} />
            ))}

            {/* SUGGEST GROUPS */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 3, mb: 1 }}
            >
              Gợi ý nhóm cho bạn
            </Typography>

            {notJoinedGroups.length === 0 && (
              <Typography fontSize="14px" color="gray" mb={2}>
                Không còn nhóm nào để tham gia.
              </Typography>
            )}

            {notJoinedGroups.map((g) => (
              <GroupItem key={g._id} g={g} router={router} />
            ))}
          </>
        )}
      </Box>
    </>
  );
};

/* ================= GROUP ITEM ================= */
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
      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${g.avatar}`}
      sx={{ width: 45, height: 45, borderRadius: "8px" }}
    />
    <Box>
      <Typography fontWeight={600}>{g.name}</Typography>
      <Typography fontSize="13px" color="text.secondary">
        {g.description || "Không có mô tả"}
      </Typography>
    </Box>
  </Box>
);

export default GroupList;
