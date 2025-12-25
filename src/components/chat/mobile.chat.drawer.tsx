"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Fab,
  Tooltip,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { IRoom, IRoomMember, RoomType } from "./chat.type";
// Local interface types to keep this component self-contained

interface IFollowItem {
  _id: string;
  follower: string;
  following: {
    _id: string;
    name: string;
    avatar?: string;
    online?: boolean;
  };
}

interface Props {
  followings: IFollowItem[];
  friendsLoading: boolean;
  groups: IRoom[];
  groupsLoading: boolean;
  // allow async handlers (Promise<void>) since parent handlers are async
  onSelectFriend: (item: IFollowItem) => void | Promise<void>;
  onSelectGroup: (room: IRoom) => void | Promise<void>;
  onCreateGroup?: () => void;
}

export default function MobileChatDrawer({
  followings,
  friendsLoading,
  groups,
  groupsLoading,
  onSelectFriend,
  onSelectGroup,
  onCreateGroup,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends");

  return (
    <>
      <Tooltip title="Tin nhắn" placement="left">
        <Fab
          size="small"
          color="default"
          aria-label="open chat"
          onClick={() => setOpen(true)}
          sx={{
            display: { xs: "flex", md: "none" },
            position: "fixed",
            top: 78,
            right: { xs: 72, sm: 80 },
            zIndex: (theme) => theme.zIndex.appBar + 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            width: 44,
            height: 44,
            color: (theme) => theme.palette.text.primary,
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 320 },
            height: { xs: "100vh", sm: "auto" },
            borderRadius: { xs: 0, sm: 1 },
            // remove default right margin on mobile so it truly fills the viewport
            ml: { xs: 0 },
          },
        }}
      >
        <Box
          sx={{ width: "100%", p: 2, height: "100%", boxSizing: "border-box" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6">Bạn bè</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tabs */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              onClick={() => setActiveTab("friends")}
              variant={activeTab === "friends" ? "contained" : "outlined"}
              sx={{ textTransform: "none", flex: 1 }}
            >
              Bạn bè
            </Button>
            <Button
              onClick={() => setActiveTab("groups")}
              variant={activeTab === "groups" ? "contained" : "outlined"}
              sx={{ textTransform: "none", flex: 1 }}
            >
              Nhóm
            </Button>
          </Box>

          <Box
            sx={{
              height: { xs: "calc(100vh - 160px)", sm: "calc(100vh - 160px)" },
              overflowY: "auto",
            }}
          >
            {activeTab === "friends" ? (
              friendsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : followings.length === 0 ? (
                <Typography>Không có bạn bè để hiển thị.</Typography>
              ) : (
                <List>
                  {followings.map((item) => (
                    <ListItem key={item._id} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          onSelectFriend(item);
                          setOpen(false);
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.following.avatar}`}
                          />
                        </ListItemAvatar>
                        <ListItemText primary={item.following.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )
            ) : (
              <>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      onCreateGroup?.();
                      setOpen(false);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    + Tạo nhóm
                  </Button>
                </Box>

                {groupsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : groups.length === 0 ? (
                  <Typography>Không có nhóm chat.</Typography>
                ) : (
                  <List>
                    {groups.map((g) => (
                      <ListItem key={g._id} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            onSelectGroup(g);
                            setOpen(false);
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {g.name?.charAt(0).toUpperCase() ?? "G"}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={g.name || "Nhóm"}
                            secondary={`${g.members.length} thành viên`}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
