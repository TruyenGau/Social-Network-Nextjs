"use client";
import { Box } from "@mui/material";
import React from "react";
import { usePathname } from "next/navigation";
import ProfileInfomation from "../../components/profile/profile.info";
import SuggestionsFriend from "./friend";
import BirthdayUser from "./birthday";
import SponsoredAds from "./advertisement";

interface IProps {
  suggesionFriend: IFriend[] | null;
}

const Rightbar = ({ suggesionFriend }: IProps) => {
  const pathname = usePathname();
  const isProfilePage = pathname.startsWith("/profile");
  const isCommunityPage = pathname.startsWith("/community");
  if (isCommunityPage) return null;

  return (
    <Box
      flex={2}
      sx={{
        display: { xs: "none", sm: "block" },
        pl: 2,
      }}
    >
      {/* FIXED SIDEBAR */}
      <Box
        sx={{
          position: "fixed",
          right: 20,
          top: 80,
          width: "28%",
          height: "calc(100vh - 100px)",
          overflowY: "auto",
          pb: 5,

          /* CUSTOM SCROLLBAR */
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c1c1c1",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#a8a8a8",
          },
        }}
      >
        {isProfilePage ? (
          <ProfileInfomation />
        ) : (
          <>
            <Box mb={3}>
              <SuggestionsFriend suggesionFriend={suggesionFriend} />
            </Box>

            <Box mb={3}>
              <BirthdayUser />
            </Box>

            <Box mb={3}>
              <SponsoredAds />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Rightbar;
