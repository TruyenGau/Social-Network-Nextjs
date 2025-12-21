"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import ProfileInfomation from "../../components/profile/profile.info";
import SuggestionsFriend from "./friend";
import BirthdayUser from "./birthday";
import SponsoredAds from "./advertisement";
import JoinedGroupsMock from "../profile/profile.joinedgroupsmock";
import GroupInfoPanel from "@/components/community/group.info.panel";
import GroupRightPanelMock from "../community/group.rightpanelmock";

interface IProps {
  suggesionFriend: IFriend[] | null;
}

const Rightbar = ({ suggesionFriend }: IProps) => {
  const pathname = usePathname();

  const isProfilePage = pathname.startsWith("/profile");
  const isCommunityPage = pathname.startsWith("/community");
  const isChatPage = pathname.startsWith("/chat");

  if (isChatPage) return null;

  return (
    <Box
      flex={2}
      sx={{
        display: { xs: "none", md: "block" },
        pl: 2,
      }}
    >
      {/* FIXED RIGHT SIDEBAR */}
      <Box
        sx={{
          position: "fixed",
          top: 75,
          right: 0,
          width: 320,
          height: "calc(100vh - 75px)",
          pr: 2,
          pl: 1,
          overflowY: "auto",

          "&::-webkit-scrollbar": { width: "6px" },
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
        {/* 👉 COMMUNITY PAGE */}
        {isCommunityPage && (
          <>
            <GroupInfoPanel />
          </>
        )}

        {/* 👉 PROFILE PAGE */}
        {isProfilePage && (
          <>
            <ProfileInfomation />
            <JoinedGroupsMock />
          </>
        )}

        {/* 👉 NORMAL FEED */}
        {!isCommunityPage && !isProfilePage && (
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
