"use client";

import { Drawer, Descriptions, Tag, Image } from "antd";
import dayjs from "dayjs";
import { IUser } from "@/types/next-auth";

interface IUserDetailProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  user: IUser | null;
}

export default function UserDetail({ open, setOpen, user }: IUserDetailProps) {
  if (!user) return null;

  return (
    <Drawer
      title="Thông Tin User"
      placement="right"
      width={480}
      onClose={() => setOpen(false)}
      open={open}
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Avatar">
          {user.avatar ? (
            <Image
              width={80}
              src={
                user?.avatar
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${user?.avatar}`
                  : "/user/default-user.png"
              }
            />
          ) : (
            <Tag>No Avatar</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Tên">{user.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {user.gender ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Tuổi">{user.age ?? "-"}</Descriptions.Item>

        <Descriptions.Item label="Ngày sinh">
          {user.birthday ? dayjs(user.birthday).format("DD-MM-YYYY") : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">
          {user.phoneNumber ?? "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ">
          {user.address ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Trường học">
          {user.school ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Công việc">
          {user.work ?? "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả">
          {user.description ?? "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Following">
          <Tag color="blue">{user.followingCount}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Followers">
          <Tag color="green">{user.followersCount}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Role">{user.role.name}</Descriptions.Item>

        <Descriptions.Item label="Communities">
          {user.communities?.length ? user.communities.join(", ") : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {dayjs(user.createdAt).format("DD-MM-YYYY HH:mm")}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
}
