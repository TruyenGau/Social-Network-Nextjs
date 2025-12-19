"use client";

import { useEffect, useState } from "react";
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import { sendRequest } from "@/utils/api";
import BirthdayWishModal from "./birthday.modal";
import { useSession } from "next-auth/react";

interface IBirthday {
  _id: string;
  name: string;
  avatar: string;
  birthday: string;
}

const BirthdayUser = () => {
  const [birthdays, setBirthdays] = useState<IBirthday[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [openWish, setOpenWish] = useState(false);
  const [targetUser, setTargetUser] = useState<IBirthday | null>(null);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await sendRequest<IBackendRes<IBirthday[]>>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/birthday/today`,
          method: "GET",
          queryParams: {
            userId: session?.user._id,
          },
        });

        setBirthdays(res.data ?? []);
      } catch (e) {
        console.log("Error birthday:", e);
      }
      setLoading(false);
    };

    fetchBirthdays();
  }, []);

  if (loading) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 3, // ~12px
        backgroundColor: "#fff",
        boxShadow: "none",
        border: "1px solid #e4e6eb",
      }}
    >
      {/* TITLE */}
      <Typography fontWeight={600} fontSize={13} color="#65676B">
        Sinh nhật
      </Typography>

      {/* TODAY'S BIRTHDAY */}
      {birthdays.length > 0 ? (
        <Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#f5f6f7" },
            }}
          >
            {/* LEFT */}
            <Box display="flex" alignItems="center" gap={1.2}>
              <Avatar
                src={
                  birthdays[0].avatar
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/avatar/images/${birthdays[0].avatar}`
                    : "/user/default-user.png"
                }
                sx={{ width: 40, height: 40 }}
              />
              <Typography fontWeight={600} fontSize={15}>
                {birthdays[0].name}
              </Typography>
            </Box>

            {/* CELEBRATE */}
            <Button
              variant="contained"
              size="small"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 2,
                fontSize: 13,
                fontWeight: 600,
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
              }}
            >
              🎂 Chúc mừng
            </Button>
          </Box>

          {/* UPCOMING SECTION */}
          {birthdays.length > 1 && (
            <Box
              mt={2}
              p={1.5}
              sx={{
                bgcolor: "#f5f6f7",
                borderRadius: 2,
              }}
            >
              <Typography fontWeight={600} fontSize={14}>
                Sinh nhật sắp tới
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        /* NO BIRTHDAY TODAY */
        <Box
          p={1.5}
          sx={{
            bgcolor: "#f5f6f7",
            borderRadius: 2,
            mt: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <CakeIcon fontSize="small" color="disabled" />
            <Typography fontWeight={600} fontSize={14}>
              Sinh nhật sắp tới
            </Typography>
          </Box>

          <Typography fontSize={13} color="text.secondary" mt={0.5}>
            Hôm nay không có ai sinh nhật 🎂
          </Typography>
        </Box>
      )}
      {openWish && targetUser && (
        <BirthdayWishModal
          open={openWish}
          user={targetUser}
          onClose={() => setOpenWish(false)}
          onSuccess={() => {
            // reload feed hoặc router.refresh()
          }}
        />
      )}
    </Paper>
  );
};

export default BirthdayUser;
