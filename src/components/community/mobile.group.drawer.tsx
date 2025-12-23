"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Button,
  Fab,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import GroupList from "./grouplist";

interface Props {
  groups: IGroups[] | null;
}

export default function MobileGroupDrawer({ groups }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Nhóm" placement="left">
        <Fab
          size="small"
          color="default"
          aria-label="open groups"
          onClick={() => setOpen(true)}
          sx={{
            display: { xs: "flex", md: "none" },
            position: "fixed",
            top: 78,
            right: 12,
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
          <MenuIcon />
        </Fab>
      </Tooltip>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6">Nhóm</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ height: "calc(100vh - 88px)", overflowY: "auto" }}>
            <GroupList groups={groups} compact />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
