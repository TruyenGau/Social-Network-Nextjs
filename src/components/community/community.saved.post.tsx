"use client";

import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
import PostListMock from "./postlistmock";

interface IProps {
  adminId: string;
}

const SavedPostList = ({ adminId }: IProps) => {
  const { data: session } = useSession();
  const [reloadFlag, setReloadFlag] = useState(false);

  if (!session) {
    return (
      <Typography textAlign="center" mt={3}>
        Bạn cần đăng nhập để xem bài viết đã lưu
      </Typography>
    );
  }

  return (
    <PostListMock
      groupId="" // ⭐ không cần groupId
      reloadFlag={reloadFlag}
      adminId={adminId}
      isSavedMode={true} // ⭐ flag mới
    />
  );
};

export default SavedPostList;
