"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PollIcon from "@mui/icons-material/Poll";
import EventIcon from "@mui/icons-material/Event";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

interface Props {
  groupId: string;
  onCreated: () => void;
}

export default function PollCreate({ groupId, onCreated }: Props) {
  const { data: session } = useSession();
  const toast = useToast();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiredAt, setExpiredAt] = useState("");

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index: number) =>
    setOptions(options.filter((_, i) => i !== index));

  const handleCreate = async () => {
    const cleanOptions = options.filter((o) => o.trim());

    if (!question.trim()) return toast.error("Vui lòng nhập câu hỏi");
    if (cleanOptions.length < 2)
      return toast.error("Poll cần ít nhất 2 lựa chọn");

    const expiredAtISO = expiredAt
      ? new Date(expiredAt).toISOString()
      : undefined;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/polls`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: {
        question,
        options: cleanOptions,
        communityId: groupId,
        expiredAt: expiredAtISO, // ✅ ISO UTC
      },
    });

    if (res.data) {
      toast.success("🎉 Tạo bình chọn thành công");
      setQuestion("");
      setOptions(["", ""]);
      setExpiredAt("");
      onCreated();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
      }}
    >
      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <PollIcon color="primary" />
        <Box>
          <Typography fontWeight={700} fontSize={18}>
            Tạo bình chọn
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Chia sẻ ý kiến với mọi người trong nhóm
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* QUESTION */}
      <Typography fontWeight={600} mb={1}>
        ❓ Câu hỏi
      </Typography>
      <TextField
        fullWidth
        placeholder="Ví dụ: Bạn thích công nghệ nào hơn?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {/* OPTIONS */}
      <Typography fontWeight={600} mt={3} mb={1}>
        🗳️ Các lựa chọn
      </Typography>

      <Stack spacing={1.5}>
        {options.map((opt, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              placeholder={`Lựa chọn ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const clone = [...options];
                clone[i] = e.target.value;
                setOptions(clone);
              }}
            />
            {options.length > 2 && (
              <IconButton color="error" onClick={() => removeOption(i)}>
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </Box>
        ))}
      </Stack>

      <Button startIcon={<AddIcon />} onClick={addOption} sx={{ mt: 1 }}>
        Thêm lựa chọn
      </Button>

      {/* EXPIRED */}
      <Typography fontWeight={600} mt={3} mb={1}>
        ⏰ Thời gian kết thúc (tuỳ chọn)
      </Typography>
      <TextField
        type="datetime-local"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={expiredAt}
        onChange={(e) => setExpiredAt(e.target.value)}
        InputProps={{
          startAdornment: <EventIcon sx={{ mr: 1, color: "gray" }} />,
        }}
      />

      {/* ACTION */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            borderRadius: 2,
          }}
          onClick={handleCreate}
        >
          Tạo bình chọn
        </Button>
      </Box>
    </Paper>
  );
}
