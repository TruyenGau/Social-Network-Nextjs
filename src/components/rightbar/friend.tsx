"use client";

import { useState } from "react";
import { Avatar, Box, Typography, IconButton, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/utils/toast";

interface IProps {
  suggesionFriend: IFriend[] | null;
}

const SuggestionsFriend = ({ suggesionFriend }: IProps) => {
  const [list, setList] = useState<IFriend[]>(suggesionFriend ?? []);
  const [showAll, setShowAll] = useState(false);
  const { data: session } = useSession();
  const route = useRouter();
  const visibleList = showAll ? list : list.slice(0, 4);
  const toast = useToast();

  const handleFollow = async (id: string) => {
    try {
      await sendRequest({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/follow/${id}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      await sendRequest<IBackendRes<any>>({
        url: "/api/revalidate",
        method: "POST",
        queryParams: {
          tag: "fetch-sug",
          secret: "levantruyen",
        },
      });
      route.refresh();
      setList((prev) => prev.filter((u) => u._id !== id));
      window.dispatchEvent(new Event("story-follow-updated"));
      toast.success("Đã theo dõi");
    } catch (err) {
      console.log("Follow Error:", err);
    }
  };

  const handleRemove = (id: string) => {
    setList((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3, // ~12px
        backgroundColor: "#fff",
        boxShadow: "none",
        border: "1px solid #e4e6eb",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={600} fontSize={13} color="#65676B">
          Gợi ý kết bạn
        </Typography>

        {list.length > 4 && (
          <Typography
            fontSize={13}
            sx={{ color: "#1976d2", cursor: "pointer", fontWeight: 500 }}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Ẩn bớt" : "Xem tất cả"}
          </Typography>
        )}
      </Box>

      <Box mt={1.5}>
        {visibleList.map((user) => (
          <Box
            key={user._id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1 }}
          >
            {/* Avatar + Name */}
            <Box display="flex" alignItems="center" gap={1.2}>
              <Avatar
                src={user?.avatar ? user.avatar : "/user/default-user.png"}
                sx={{ width: 38, height: 38 }}
              />
              <Typography fontSize={14} fontWeight={600}>
                {user.name}
              </Typography>
            </Box>

            {/* ✓ & X Buttons */}
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton
                size="small"
                onClick={() => handleFollow(user._id)} // FOLLOW
                sx={{
                  color: "#1976d2",
                  "&:hover": { backgroundColor: "#e7f1ff" },
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => handleRemove(user._id)} // REMOVE
                sx={{
                  bgcolor: "#e4e6eb",
                  "&:hover": { bgcolor: "#d8dadd" },
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}

        {list.length === 0 && (
          <Typography mt={2} fontSize={13} color="text.secondary">
            Không có gợi ý nào 🎉
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default SuggestionsFriend;
