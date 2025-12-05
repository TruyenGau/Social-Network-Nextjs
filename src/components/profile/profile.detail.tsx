"use client";

import { FC, useContext, useEffect, useState } from "react";
import { Avatar, Box, Typography, Divider, Grid, Paper } from "@mui/material";
import { IUser } from "@/types/next-auth";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { UserContext } from "@/lib/track.wrapper";
import { useRouter } from "next/navigation";

interface IProps {
  userId: string;
  users: IUser | null;
  posts: IPost[] | null;
}

const ProfileDetail = (props: IProps) => {
  const { data: session } = useSession();
  const userId = props.userId;
  const route = useRouter();
  const { userInfoId, setUserInfoId } = useContext(UserContext) as IContext;

  useEffect(() => {
    setUserInfoId(userId);
  }, [userId]);

  const user = props.users;
  const posts = props.posts;

  if (!user) return <p>Loading...</p>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      {/* COVER */}
      <Box
        sx={{
          height: 220,
          width: "100%",
          borderRadius: 2,
          position: "relative", // bỏ overflow: hidden
        }}
      >
        <img
          src={
            user.coverPhoto
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.coverPhoto}`
              : "/default-cover.jpg"
          }
          alt="Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* AVATAR */}
        <Avatar
          src={
            user?.avatar
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${user.avatar}`
              : "/user/default-user.png"
          }
          sx={{
            width: 128,
            height: 128,
            border: "4px solid white",
            position: "absolute",
            bottom: -64,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        />
      </Box>

      {/* NAME & STATS */}
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold">
          {user.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            mt: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography fontWeight="bold">{posts?.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Posts
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography fontWeight="bold">{user.followersCount}</Typography>
            <Typography variant="body2" color="text.secondary">
              Followers
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography fontWeight="bold">{user.followingCount}</Typography>
            <Typography variant="body2" color="text.secondary">
              Following
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* POSTS */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Bài viết của bạn ({posts?.length})
        </Typography>
        <Grid container spacing={2}>
          {posts?.length ? (
            posts.map((post) => (
              <Grid item xs={12} key={post._id}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography mt={0.5}>{post.content}</Typography>
                  {post.images && post.images.length > 0 && (
                    <Box mt={1}>
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/images/${img}`}
                          alt={`Post image ${idx}`}
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            marginTop: 4,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  {post.videos && post.videos.length > 0 && (
                    <Box mt={1}>
                      {post.videos.map((video, idx) => (
                        <video
                          key={idx}
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/post/videos/${video}`}
                          controls
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            marginTop: 4,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography ml={1}>Bạn chưa có bài viết nào.</Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfileDetail;
