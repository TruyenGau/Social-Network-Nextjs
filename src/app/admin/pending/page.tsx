"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Tooltip,
  Image,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { IAdminPost } from "./admin-post";

export default function AdminPendingPostsPage() {
  const { data: session } = useSession();

  const [posts, setPosts] = useState<IAdminPost[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================
   * FETCH POSTS
   * ========================= */
  const fetchPendingPosts = async () => {
    if (!session?.access_token) return;

    setLoading(true);

    const res = await sendRequest<IBackendRes<IAdminPost[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/admin/pending`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setPosts(res?.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingPosts();
  }, [session]);

  /* =========================
   * REVIEW POST
   * ========================= */
  const reviewPost = async (
    postId: string,
    action: "APPROVE" | "REJECT" | "DELETE"
  ) => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/admin/${postId}/review`,
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { action },
    });

    if (res?.data?.success) {
      message.success("Đã xử lý bài viết");
      fetchPendingPosts();
    } else {
      message.error(res?.data?.message || "Xử lý thất bại");
    }
  };

  /* =========================
   * TABLE COLUMNS
   * ========================= */
  const columns: ColumnsType<IAdminPost> = [
    {
      title: "Người đăng",
      dataIndex: "userId",
      render: (u) => (
        <>
          <div style={{ fontWeight: 500 }}>{u.name}</div>
          <small style={{ color: "#888" }}>{u.email}</small>
        </>
      ),
    },

    {
      title: "Nội dung",
      dataIndex: "content",
      ellipsis: true,
      render: (v: string) =>
        v ? (
          <Tooltip title={v}>
            <span>{v}</span>
          </Tooltip>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        ),
    },

    {
      title: "Ảnh",
      dataIndex: "images",
      render: (imgs: string[]) =>
        imgs?.length ? (
          <Image
            width={60}
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${imgs[0]}`}
          />
        ) : (
          "—"
        ),
    },

    {
      title: "AI Flag",
      dataIndex: "aiFlag",
      render: (v) => (v ? <Tag color="red">AI FLAG</Tag> : <Tag>OK</Tag>),
    },

    {
      title: "AI Reason",
      dataIndex: "aiReason",
      render: (v) =>
        v ? (
          <Tooltip title={v}>
            <span>{v}</span>
          </Tooltip>
        ) : (
          "—"
        ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (v) => (
        <Tag color={v === "PENDING" ? "orange" : "green"}>{v}</Tag>
      ),
    },

    {
      title: "Xử lý",
      width: 260,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Duyệt bài viết?"
            onConfirm={() => reviewPost(record._id, "APPROVE")}
          >
            <Button type="primary">Approve</Button>
          </Popconfirm>

          <Popconfirm
            title="Từ chối bài viết?"
            onConfirm={() => reviewPost(record._id, "REJECT")}
          >
            <Button danger>Reject</Button>
          </Popconfirm>

          <Popconfirm
            title="Xóa vĩnh viễn bài viết?"
            onConfirm={() => reviewPost(record._id, "DELETE")}
          >
            <Button danger type="dashed">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* =========================
   * RENDER
   * ========================= */
  return (
    <Card
      title="Duyệt bài viết AI"
      extra={<Button icon={<ReloadOutlined />} onClick={fetchPendingPosts} />}
    >
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
