"use client";
import React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Button,
} from "@mui/material";

interface ProfileCardProps {
  name: string;
  followers: number;
  avatarUrl: string;
  coverUrl: string;
  id: string;
}

const ProfileCard = ({
  id,
  name,
  followers,
  avatarUrl,
  coverUrl,
}: ProfileCardProps) => {
  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        textAlign: "center",
        p: 1,
      }}
    >
      <CardMedia
        component="img"
        height="80" //
        image={`${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${coverUrl}`}
      />

      <Box sx={{ display: "flex", justifyContent: "center", mt: -3 }}>
        <Avatar
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${avatarUrl}`}
          sx={{ width: 55, height: 55, border: "2px solid white" }}
        />
      </Box>

      <CardContent sx={{ mt: 1, p: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {followers} followers
        </Typography>

        <Link href={`/profile/${id}`} style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            sx={{
              mt: 1,
              borderRadius: "16px",
              textTransform: "none",
              px: 2,
              py: 0.5,
              fontSize: "0.8rem", // chữ nhỏ hơn
              backgroundColor: "#1877F2",
              "&:hover": {
                backgroundColor: "#1877F2 !important", // giữ nguyên 👈
              },
            }}
          >
            My Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
export default ProfileCard;
