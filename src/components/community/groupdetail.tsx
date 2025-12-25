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
import PollCreate from "../poll/poll.create";
import PollList from "../poll/poll.list";

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
  const isAdmin =
    !!session && group.admins.some((admin) => admin._id === session.user._id);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        mt: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 1200 },
          display: "flex",
          flexDirection: "column",
          px: { xs: 1.5, sm: 2 },
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
        {/* COVER */}
        <Box
          sx={{
            width: "100%",
            height: { xs: 180, sm: 300 },
            borderRadius: "12px",
            overflow: "hidden",
            mb: 2,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${group.coverPhoto}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        {/* HEADER */}
        <Box sx={{ width: "100%", mb: 3, position: "relative" }}>
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${group.avatar}`}
            sx={{
              width: { xs: 80, sm: 120 },
              height: { xs: 80, sm: 120 },
              border: "4px solid white",
              position: "absolute",
              top: { xs: -40, sm: -60 },
              left: { xs: 12, sm: 20 },
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: 3,
            }}
          />

          <Box sx={{ height: { xs: 48, sm: 70 } }} />

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ fontSize: { xs: 20, sm: 34 } }}
          >
            {group.name}
          </Typography>

          <Typography color="gray" sx={{ mt: 0.5 }}>
            👥 {group.membersCount} thành viên · 📝 {group.postsCount} bài viết
          </Typography>

          {/* Members preview */}
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            {group.members.slice(0, 10).map((m, i) => (
              <Avatar
                key={i}
                src={
                  m.avatar
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${m.avatar}`
                    : "/user/default-user.png"
                }
                sx={{
                  width: { xs: 28, sm: 34 },
                  height: { xs: 28, sm: 34 },
                  border: "2px solid white",
                  mb: 0.5,
                }}
              />
            ))}
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
            }}
          >
            {group.isJoined ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleLeave}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Rời nhóm
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleJoin}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Tham gia nhóm
              </Button>
            )}

            <Button
              variant="contained"
              sx={{ ml: 1, width: { xs: "100%", sm: "auto" } }}
              onClick={() => setOpenInvite(true)}
            >
              + Mời
            </Button>

            {group.admins[0]._id === session?.user._id && (
              <Button
                variant="outlined"
                color="error"
                sx={{
                  ml: 1,
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                }}
                onClick={() => setOpenConfirm(true)}
              >
                Xóa nhóm
              </Button>
            )}
            {group.admins[0]._id === session?.user._id && (
              <Button
                variant="outlined"
                color="success"
                sx={{
                  ml: 1,
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                }}
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
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            gap: { xs: 0, md: 4 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", sm: 720, md: 760, lg: 820 },
              minWidth: 0,
            }}
          >
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
            {activeTab === "events" && (
              <>
                {isAdmin ? (
                  <PollCreate groupId={groupId} onCreated={fetchGroup} />
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ mb: 2, fontStyle: "italic" }}
                  >
                    Chỉ quản trị viên nhóm mới có thể tạo bình chọn.
                  </Typography>
                )}

                <PollList groupId={groupId} />
              </>
            )}
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
