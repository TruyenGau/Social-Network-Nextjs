"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";
import type { ReportReason, ICreateReportPayload } from "./report";
import { REPORT_REASON_LABEL } from "./report";

interface IProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  session: any;
}

const ReportPostModal = ({ postId, open, onClose, session }: IProps) => {
  const toast = useToast();
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session?.access_token) {
      toast.error("Bạn cần đăng nhập");
      return;
    }

    setLoading(true);

    const payload: ICreateReportPayload = {
      targetType: "POST",
      targetId: postId,
      reason,
      description: description.trim() || undefined,
    };

    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reports`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: payload,
    });

    setLoading(false);

    if (res?.data?.success) {
      toast.success("Đã gửi báo cáo");
      setDescription("");
      setReason("SPAM");
      onClose();
    } else {
      toast.error(res?.data?.message || "Gửi báo cáo thất bại");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Báo cáo bài viết</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Lý do báo cáo
          </Typography>

          <RadioGroup
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
          >
            {Object.entries(REPORT_REASON_LABEL).map(([key, label]) => (
              <FormControlLabel
                key={key}
                value={key}
                control={<Radio />}
                label={label}
              />
            ))}
          </RadioGroup>

          <TextField
            label="Mô tả thêm (không bắt buộc)"
            multiline
            minRows={3}
            fullWidth
            sx={{ mt: 2 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={loading}
        >
          Gửi báo cáo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportPostModal;
