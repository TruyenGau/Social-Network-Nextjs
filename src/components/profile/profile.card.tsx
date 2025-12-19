"use client";
import Link from "next/link";
import { Box, Avatar, Typography, ListItemButton } from "@mui/material";

interface ProfileCardProps {
  id: string;
  name: string;
  avatarUrl: string;
}

const ProfileCard = ({ id, name, avatarUrl }: ProfileCardProps) => {
  return (
    <ListItemButton
      component={Link}
      href={`/profile/${id}`}
      sx={{
        borderRadius: "8px",
        py: 1,
        px: 1,
        mb: 0.5,
        "&:hover": { bgcolor: "#f0f2f5" },
      }}
    >
      <Avatar
        src={
          avatarUrl
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${avatarUrl}`
            : "/user/default-user.png"
        }
        sx={{ width: 36, height: 36, mr: 1.5 }}
      />
      <Typography fontSize={14} fontWeight={500}>
        {name}
      </Typography>
    </ListItemButton>
  );
};

export default ProfileCard;
