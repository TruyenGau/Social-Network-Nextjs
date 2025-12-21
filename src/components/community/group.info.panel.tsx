"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const GroupInfoPanel = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const groupId = pathname.split("/").pop();

  const [group, setGroup] = useState<IGroups | null>(null);

  useEffect(() => {
    if (!session || !groupId) return;

    sendRequest<IBackendRes<IGroups>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }).then((res) => setGroup(res.data ?? null));
  }, [session, groupId]);

  if (!group) return null;

  return (
    <Box
      sx={{
        width: "100%",
        position: "sticky",
        top: 70,
      }}
    >
      {/* ================= GIỚI THIỆU ================= */}
      <Card
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
          boxShadow: "0 8px 24px rgba(24,119,242,0.08)",
          border: "1px solid #e6eeff",
        }}
      >
        <Typography fontWeight={700} fontSize={16} mb={1.5}>
          Giới thiệu
        </Typography>

        <Typography fontSize={14} color="#444" lineHeight={1.6}>
          {group.description || "Nhóm chưa có mô tả."}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <InfoRow
            icon="🌐"
            title={group.visibility}
            desc="Mọi người có thể xem nội dung nhóm."
          />
          <InfoRow
            icon="👁️"
            title="Hiển thị"
            desc="Ai cũng có thể tìm thấy nhóm này."
          />
          <InfoRow icon="📍" title="Việt Nam" />
        </Stack>
      </Card>

      {/* ================= THỐNG KÊ ================= */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1.5}>
          Thống kê
        </Typography>

        <Stack spacing={1}>
          <StatRow label="👥 Thành viên" value={group.membersCount} />
          <StatRow label="📝 Bài viết" value={group.postsCount} />
          <StatRow label="🛡️ Quản trị viên" value={group.admins?.length || 1} />
        </Stack>
      </Card>

      {/* ================= THÀNH VIÊN NỔI BẬT ================= */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1.5}>
          Thành viên nổi bật
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {group.members?.slice(0, 6).map((m: any, i: number) => (
            <Avatar
              key={i}
              src={m.avatar ? m.avatar : "/user/default-user.png"}
              sx={{ width: 40, height: 40 }}
            />
          ))}
        </Stack>

        <Typography
          mt={1.5}
          fontSize={13}
          color="#1877f2"
          sx={{ cursor: "pointer", fontWeight: 600 }}
        >
          Xem tất cả
        </Typography>
      </Card>

      {/* ================= NỘI QUY ================= */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1.5}>
          Nội quy nhóm
        </Typography>

        <Stack spacing={1}>
          <RuleItem text="Tôn trọng tất cả thành viên" />
          <RuleItem text="Không spam, quảng cáo" />
          <RuleItem text="Nội dung phù hợp, lành mạnh" />
        </Stack>
      </Card>

      {/* ================= TAGS ================= */}
      <Card sx={cardStyle}>
        <Typography fontWeight={700} fontSize={16} mb={1.5}>
          Chủ đề
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="Học tập" />
          <Chip label="Chia sẻ" />
          <Chip label="Công nghệ" />
          <Chip label="Kinh nghiệm" />
        </Stack>
      </Card>
    </Box>
  );
};

export default GroupInfoPanel;

/* ================= COMPONENT PHỤ ================= */

const cardStyle = {
  p: 2.5,
  mb: 2,
  borderRadius: 3,
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  border: "1px solid #eef1f5",
};

const InfoRow = ({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc?: string;
}) => (
  <Box sx={{ display: "flex", gap: 1.5 }}>
    <Typography fontSize={20}>{icon}</Typography>
    <Box>
      <Typography fontSize={14} fontWeight={600}>
        {title}
      </Typography>
      {desc && (
        <Typography fontSize={13} color="text.secondary">
          {desc}
        </Typography>
      )}
    </Box>
  </Box>
);

const StatRow = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Typography fontSize={14}>{label}</Typography>
    <Typography fontSize={14} fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

const RuleItem = ({ text }: { text: string }) => (
  <Typography fontSize={13}>✔️ {text}</Typography>
);
