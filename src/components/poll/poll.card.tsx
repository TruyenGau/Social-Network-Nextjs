"use client";

import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import PollIcon from "@mui/icons-material/Poll";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { useState } from "react";
import { useToast } from "@/utils/toast";

interface Props {
  poll: IPollPublic;
}

export default function PollCard({ poll }: Props) {
  const { data: session } = useSession();
  const toast = useToast();

  const [data, setData] = useState<IPollPublic>(poll);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const totalVotes = data.options.reduce((sum, o) => sum + o.votes, 0);

  // =========================
  // CHECK HẾT HẠN / ĐÓNG POLL
  // =========================
  const isExpired =
    data.expiredAt && new Date(data.expiredAt).getTime() <= Date.now();

  const isClosed = !data.isActive || isExpired;

  // =========================
  // TÌM OPTION THẮNG CUỘC
  // =========================
  const maxVotes =
    data.options.length > 0 ? Math.max(...data.options.map((o) => o.votes)) : 0;

  const winningIndexes = data.options
    .map((o, i) => (o.votes === maxVotes && maxVotes > 0 ? i : -1))
    .filter((i) => i !== -1);

  // =========================
  // HANDLE VOTE / RE-VOTE
  // =========================
  const handleVote = async (index: number) => {
    if (isClosed) return;

    setLoadingIndex(index);

    const res = await sendRequest<IBackendRes<IPollPublic>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/polls/${data._id}/vote`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: { optionIndex: index },
    });

    setLoadingIndex(null);

    if (res.data) {
      setData(res.data);
      setSelectedIndex(index);
      toast.success("Đã cập nhật lựa chọn");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 3,
      }}
    >
      {/* ================= HEADER ================= */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <PollIcon color="primary" />

        <Typography fontWeight={700} fontSize={18}>
          {data.question}
        </Typography>

        <Box flex={1} />

        <Chip
          size="small"
          label={isClosed ? "Đã kết thúc" : "Đang mở"}
          color={isClosed ? "default" : "success"}
        />
      </Stack>

      {/* ================= OPTIONS ================= */}
      <Stack spacing={2}>
        {data.options.map((opt, i) => {
          const percent =
            totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

          const isSelected = selectedIndex === i;
          const isWinner = isClosed && winningIndexes.includes(i);

          return (
            <Box key={i}>
              <Button
                fullWidth
                variant={
                  isWinner ? "contained" : isSelected ? "contained" : "outlined"
                }
                color={
                  isWinner ? "success" : isSelected ? "primary" : "inherit"
                }
                disabled={isClosed || loadingIndex !== null}
                onClick={() => handleVote(i)}
                sx={{
                  justifyContent: "space-between",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.2,
                }}
                startIcon={
                  isWinner ? (
                    <EmojiEventsIcon fontSize="small" />
                  ) : isSelected ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : undefined
                }
              >
                <span>{opt.text}</span>
                <span>{percent}%</span>
              </Button>

              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  mt: 0.8,
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#e3f2fd",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                  },
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {opt.votes} lượt bình chọn
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* ================= FOOTER ================= */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Tổng cộng: {totalVotes} lượt vote
      </Typography>

      {/* ================= SUMMARY ================= */}
      {isClosed && (
        <Typography sx={{ mt: 1.5, fontWeight: 600 }} color="success.main">
          🏆 Kết quả cuối cùng
          {winningIndexes.length > 1 ? " (Hoà)" : ""}
        </Typography>
      )}
    </Paper>
  );
}
