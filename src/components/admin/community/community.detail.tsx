"use client";

import { Drawer, Descriptions, Tag, Image, Avatar, Space, List } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  groupId: string | null;
}

export default function CommunityDetailDrawer({
  open,
  setOpen,
  groupId,
}: IProps) {
  const [group, setGroup] = useState<IGroups | null>(null);
  const { data: session } = useSession();

  // Fetch detail when open
  useEffect(() => {
    if (!open || !groupId) return;

    const fetchDetail = async () => {
      const res = await sendRequest<IBackendRes<IGroups>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${groupId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      setGroup(res?.data ?? null);
    };

    fetchDetail();
  }, [open, groupId]);

  if (!group) return null;

  return (
    <Drawer
      title="Thông Tin Community"
      placement="right"
      width={520}
      onClose={() => setOpen(false)}
      open={open}
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Ảnh bìa">
          {group.coverPhoto ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${group.coverPhoto}`}
              width="100%"
              height={150}
              style={{ objectFit: "cover", borderRadius: 6 }}
            />
          ) : (
            <Tag>No Cover</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Avatar">
          <Avatar
            size={80}
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${group.avatar}`}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Tên">{group.name}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{group.description}</Descriptions.Item>

        <Descriptions.Item label="Thành viên">
          <Tag color="blue">{group.membersCount}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Bài viết">
          <Tag color="green">{group.postsCount}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Quản trị viên">
          {group.admins?.map((a) => (
            <Space key={a._id} style={{ marginBottom: 10, display: "block" }}>
              <Avatar
                style={{ border: "2px solid gold" }}
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${a.avatar}`}
              />
              <span>
                {a.name} <Tag color="gold">Admin</Tag>
              </span>
            </Space>
          ))}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {dayjs(group.createdAt).format("DD-MM-YYYY HH:mm")}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày cập nhật">
          {dayjs(group.updatedAt).format("DD-MM-YYYY HH:mm")}
        </Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: 20 }}>Danh sách thành viên tham gia</h3>

      <List
        itemLayout="horizontal"
        dataSource={group.members}
        renderItem={(m) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  size={48}
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${m.avatar}`}
                />
              }
              title={<strong>{m.name}</strong>}
              description={m.email ?? "-"}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
}
