"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import CreatePost from "./create.post.group";
import { IUser } from "@/types/next-auth";
import { useHasMounted } from "@/utils/customHook";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import PostListMock from "./postlistmock";
import GroupMembersList from "./community.members";
import { useToast } from "@/utils/toast";
import SavedPostList from "./community.saved.post";
import InviteFriendsDialog from "./community.invite.friend";
import UpdateGroupModal from "./update.community";

interface IProps {
  groupId: string;
  user: IUser | null;
}

const GroupDetailPage = ({ groupId, user }: IProps) => {
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  const router = useRouter();

  const [group, setGroup] = useState<IGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadPostFlag, setReloadPostFlag] = useState(false);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("discussion");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openInvite, setOpenInvite] = useState<boolean>(false);
  const handlePostCreated = () => setReloadPostFlag(!reloadPostFlag);
  const [openUpdate, setOpenUpdate] = useState(false);

  const fetchGroup = async () => {
    if (!session) return;

    setLoading(true);
    const res = await sendRequest<IBackendRes<IGroups>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    setGroup(res.data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchGroup();
  }, [session]);

  if (!hasMounted || loading) return <p>Loading...</p>;
  if (!group) return <p>Không tìm thấy nhóm.</p>;

  const handleJoin = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/join`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    router.refresh();
    if (res.data) fetchGroup();
  };

  const handleLeave = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}/leave`,
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    router.refresh();
    if (res.data) fetchGroup();
  };

  const handleDeleteGroup = async (groupId: string) => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.statusCode === 200) {
      await sendRequest<IBackendRes<any>>({
        url: "/api/revalidate",
        method: "POST",
        queryParams: {
          tag: "fetch-groups",
          secret: "levantruyen",
        },
      });
      toast.success("Bạn đã xóa nhóm thành công");
      router.push("/community");
      router.refresh();
    } else {
      toast.error("Có lỗi nãy ra");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: "20px",
        display: "flex",
        justifyContent: "center",
        ml: "3%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px",
          display: "flex",
          flexDirection: "column",
          px: 2,
        }}
      >
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Xác nhận xoá nhóm</DialogTitle>
          <DialogContent>
            <Typography>Bạn có chắc chắn muốn xoá nhóm này không?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Hủy</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setOpenConfirm(false);
                handleDeleteGroup(groupId);
              }}
            >
              Xoá
            </Button>
          </DialogActions>
        </Dialog>
        ;{/* COVER */}
        <Box
          sx={{
            width: "100%",
            height: "300px",
            borderRadius: "12px",
            overflow: "hidden",
            mb: 2,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${group.coverPhoto}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        {/* HEADER */}
        <Box sx={{ width: "100%", mb: 3, position: "relative" }}>
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/group/images/${group.avatar}`}
            sx={{
              width: 120,
              height: 120,
              border: "4px solid white",
              position: "absolute",
              top: -60,
              left: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 3,
            }}
          />

          <Box sx={{ height: 70 }} />

          <Typography variant="h4" fontWeight={700}>
            {group.name}
          </Typography>

          <Typography color="gray" sx={{ mt: 0.5 }}>
            👥 {group.membersCount} thành viên · 📝 {group.postsCount} bài viết
          </Typography>

          {/* Members preview */}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            {group.members.slice(0, 10).map((m, i) => (
              <Avatar
                key={i}
                src={
                  m.avatar
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${m.avatar}`
                    : "/user/default-user.png"
                }
                sx={{ width: 34, height: 34, border: "2px solid white" }}
              />
            ))}
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            {group.isJoined ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleLeave}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Rời nhóm
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleJoin}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Tham gia nhóm
              </Button>
            )}

            <Button
              variant="contained"
              sx={{ ml: 1 }}
              onClick={() => setOpenInvite(true)}
            >
              + Mời
            </Button>

            {group.admins[0]._id === session?.user._id && (
              <Button
                variant="outlined"
                color="error"
                sx={{ ml: 1, fontWeight: 600 }}
                onClick={() => setOpenConfirm(true)}
              >
                Xóa nhóm
              </Button>
            )}
            {group.admins[0]._id === session?.user._id && (
              <Button
                variant="outlined"
                color="success"
                sx={{ ml: 1, fontWeight: 600 }}
                onClick={() => setOpenUpdate(true)}
              >
                Cập nhật thông tin nhóm
              </Button>
            )}
          </Box>

          {/* Tabs */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              mt: 3,
              borderBottom: "1px solid #eee",
              pb: 1,
            }}
          >
            {[
              { key: "discussion", label: "Thảo luận" },
              { key: "saved", label: "Đã lưu" },
              { key: "highlight", label: "Đáng chú ý" },
              { key: "members", label: "Thành viên" },
              { key: "events", label: "Sự kiện" },
              { key: "files", label: "File" },
            ].map((tab) => (
              <Typography
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                sx={{
                  cursor: "pointer",
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  borderBottom:
                    activeTab === tab.key ? "3px solid #1877f2" : "",
                  color: activeTab === tab.key ? "#1877f2" : "#333",
                }}
              >
                {tab.label}
              </Typography>
            ))}
          </Box>
        </Box>
        {/* BODY CONTENT */}
        <Box sx={{ display: "flex", width: "100%", gap: 4 }}>
          <Box sx={{ width: "750px" }}>
            {activeTab === "discussion" && (
              <>
                <CreatePost
                  user={user}
                  groupId={groupId}
                  onPostCreated={handlePostCreated}
                  isJoined={group.isJoined}
                />
                <PostListMock
                  groupId={groupId}
                  reloadFlag={reloadPostFlag}
                  adminId={group.admins[0]._id}
                />
              </>
            )}

            {activeTab === "members" && <GroupMembersList groupId={groupId} />}
            {activeTab === "saved" && (
              <SavedPostList adminId={group.admins[0]._id} />
            )}
          </Box>

          <Box sx={{ width: "330px", position: "sticky", top: 90 }}>
            <Card sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Giới thiệu
              </Typography>

              {/* Mô tả nhóm */}
              <Typography sx={{ mt: 1, fontSize: "14px", color: "#444" }}>
                {group.description || "Ae vào nhóm vui vẻ hoà đồng!"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Thông tin cố định */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Quyền riêng tư */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography fontSize="18px">🌐</Typography>
                  <Box>
                    <Typography fontSize="14px" fontWeight={600}>
                      {group.visibility}
                    </Typography>
                    <Typography fontSize="13px" color="text.secondary">
                      Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và
                      những gì họ đăng.
                    </Typography>
                  </Box>
                </Box>

                {/* Hiển thị */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography fontSize="18px">👁️</Typography>
                  <Box>
                    <Typography fontSize="14px" fontWeight={600}>
                      Hiển thị
                    </Typography>
                    <Typography fontSize="13px" color="text.secondary">
                      Ai cũng có thể tìm thấy nhóm này.
                    </Typography>
                  </Box>
                </Box>

                {/* Vị trí */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography fontSize="18px">📍</Typography>
                  <Typography fontSize="14px" fontWeight={600}>
                    Việt Nam
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
      <InviteFriendsDialog
        open={openInvite}
        onClose={() => setOpenInvite(false)}
        groupId={groupId}
      />
      <UpdateGroupModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        group={group}
        onUpdated={fetchGroup}
      />
    </Box>
  );
};

export default GroupDetailPage;
