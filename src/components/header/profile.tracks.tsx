"use client";

import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { ListItem } from "@mui/material";
import { useContext } from "react";

import PauseIcon from "@mui/icons-material/Pause";
import Link from "next/link";
import { convertSlugUrl } from "@/utils/api";
const ProfileTracks = (props: any) => {
  const { data } = props;
  const theme = useTheme();

  return <></>;
};

export default ProfileTracks;
