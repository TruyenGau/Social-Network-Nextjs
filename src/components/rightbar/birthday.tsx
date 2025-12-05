"use client";

import { useEffect, useState } from "react";
import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import { sendRequest } from "@/utils/api";

interface IBirthday {
  _id: string;
  name: string;
  avatar: string;
  birthday: string;
}

const BirthdayUser = () => {
  const [birthdays, setBirthdays] = useState<IBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await sendRequest<IBackendRes<IBirthday[]>>({
          url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/birthday/today`,
          method: "GET",
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
      sx={{ p: 2, borderRadius: 3, backgroundColor: "#fff" }}
    >
      {/* TITLE */}
      <Typography fontWeight={600} fontSize={15} mb={1}>
        Sinh nhật hôm nay
      </Typography>

      {/* TODAY'S BIRTHDAY */}
      {birthdays.length > 0 ? (
        <Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
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
                borderRadius: 2,
                px: 2,
                bgcolor: "#1877F2",
              }}
            >
              Chúc mừng
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
              <Typography fontSize={13} color="text.secondary">
                Còn {birthdays.length - 1} người nữa sắp đến sinh nhật
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
    </Paper>
  );
};

export default BirthdayUser;
