"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/utils/toast";

interface IProps {
  groupId: string;
}

const GroupMembersList = ({ groupId }: { groupId: string }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);

  // ⚡ MENU 3 CHẤM
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const isMenuOpen = Boolean(anchorEl);
  const toast = useToast();

  const handleMenuOpen = (event: any, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const fetchMembers = async () => {
    setLoading(true);

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/members/${groupId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    setMembers(res.data?.comm?.members ?? []);
    setAdmins(res.data?.comm?.admins ?? []);

    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchMembers();
  }, [session]);

  if (loading) return <p>Đang tải danh sách thành viên...</p>;

  // ================================
  //  ⚡ API KICK USER
  // ================================
  const handleKickUser = async () => {
    if (!selectedUserId) return;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/remove-member/${selectedUserId}`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    handleMenuClose();
    toast.success("Đã xóa người dùng ra khỏi nhóm thành công");
    fetchMembers(); // Reload list
  };

  // ================================
  //  CHECK ADMIN
  // ================================
  const isCurrentUserAdmin = admins.some(
    (ad: any) => ad._id === session?.user._id
  );

  return (
    <Box sx={{ mt: 2 }}>
      {/* ================= ADMIN ================= */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        👑 Quản trị viên ({admins.length})
      </Typography>

      {admins.map((m, i) => (
        <Card
          key={`admin-${i}`}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderLeft: "4px solid #1877f2",
          }}
        >
          <Avatar
            src={m.avatar ? m.avatar : "/user/default-user.png"}
            sx={{ width: 50, height: 50 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={700}>{m.name}</Typography>
            <Typography color="gray">{m.email}</Typography>
          </Box>

          {/* Admin không thể tự kick mình */}
          {isCurrentUserAdmin && m._id !== session?.user._id && (
            <IconButton onClick={(e) => handleMenuOpen(e, m._id)}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Card>
      ))}

      {/* ================= MEMBERS ================= */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 2 }}>
        👥 Thành viên ({members.length})
      </Typography>

      {members.map((m, i) => (
        <Card
          key={`member-${i}`}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Avatar
            src={m.avatar ? m.avatar : "/user/default-user.png"}
            sx={{ width: 50, height: 50 }}
          />

          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={700}>{m.name}</Typography>
            <Typography color="gray">{m.email}</Typography>
          </Box>

          {/* ONLY ADMIN can see menu */}
          {isCurrentUserAdmin && (
            <IconButton onClick={(e) => handleMenuOpen(e, m._id)}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Card>
      ))}

      {/* MENU 3 CHẤM */}
      <Menu open={isMenuOpen} anchorEl={anchorEl} onClose={handleMenuClose}>
        <MenuItem onClick={handleKickUser}>❌ Xóa khỏi nhóm</MenuItem>
      </Menu>
    </Box>
  );
};

export default GroupMembersList;
