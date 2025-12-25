"use client";

import { Drawer, Descriptions, Tag, Image, Spin } from "antd";
import dayjs from "dayjs";
import { IUser } from "@/types/next-auth";

interface IProps {
  open: boolean;
  onClose: () => void;
  type: "POST" | "USER";
  data: IUser | IPostDetail | null;
  loading: boolean;
}

export default function ReportTargetDrawer({
  open,
  onClose,
  type,
  data,
  loading,
}: IProps) {
  console.log("🚀 ~ file: report.detail.tsx:10 ~ data:", data);
  return (
    <Drawer
      title={`Chi tiết ${type === "POST" ? "Bài viết" : "Người dùng"}`}
      placement="right"
      width={520}
      onClose={onClose}
      open={open}
    >
      {loading ? (
        <Spin />
      ) : !data ? (
        <Tag color="red">Không có dữ liệu</Tag>
      ) : type === "USER" ? (
        /* ================= USER ================= */
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Avatar">
            {(data as IUser).avatar ? (
              <Image
                width={80}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                  (data as IUser).avatar
                }`}
              />
            ) : (
              <Tag>No Avatar</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Tên">
            {(data as IUser).name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {(data as IUser).email}
          </Descriptions.Item>

          <Descriptions.Item label="Followers">
            <Tag color="green">{(data as IUser).followersCount}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Following">
            <Tag color="blue">{(data as IUser).followingCount}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {dayjs((data as IUser).createdAt).format("DD-MM-YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        /* ================= POST ================= */
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Nội dung">
            {(data as IPostDetail).content}
          </Descriptions.Item>

          <Descriptions.Item label="Tác giả">
            {(data as IPostDetail)?.author?.name}
          </Descriptions.Item>

          <Descriptions.Item label="Likes">
            <Tag color="red">{(data as IPostDetail).likesCount}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Comments">
            <Tag color="blue">{(data as IPostDetail).commentsCount}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {dayjs((data as IPostDetail).createdAt).format("DD-MM-YYYY HH:mm")}
          </Descriptions.Item>

          {(data as IPostDetail).images?.length > 0 && (
            <Descriptions.Item label="Ảnh">
              <Image
                width={200}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${
                  (data as IPostDetail).images[0]
                }`}
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Drawer>
  );
}
