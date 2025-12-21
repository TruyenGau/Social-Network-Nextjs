"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Input,
  Button,
  Space,
  Popconfirm,
  message,
  Avatar,
} from "antd";

import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { sendRequest } from "@/utils/api";
import { ColumnsType } from "antd/es/table";
import PostCreateModal from "@/components/admin/post/post.create";

interface IPostPageRes {
  result: IPost[];
  meta: { current: number; pageSize: number; total: number };
}

export default function PostPage() {
  const { data: session } = useSession();

  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [openCreate, setOpenCreate] = useState(false);

  // ============================
  // FETCH POSTS
  // ============================
  const fetchPosts = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    const res = await sendRequest<IBackendRes<IPostPageRes>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/all`,
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: {
        current: page,
        pageSize,
        sort: "-createdAt",
        namePost: searchText ? `/${searchText}/i` : undefined,
        content: searchText ? `/${searchText}/i` : undefined,
      },
    });

    setPosts(res?.data?.result ?? []);
    setTotal(res?.data?.meta?.total ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [page, pageSize, session]);

  // ============================
  // DELETE POST
  // ============================
  const handleDelete = async (_id: string) => {
    try {
      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${_id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res?.data) {
        message.success("Xóa bài viết thành công");
        fetchPosts();
      }
    } catch (err) {
      message.error("Xóa bài viết thất bại");
    }
  };

  // ============================
  // TABLE COLUMNS
  // ============================
  const columns: ColumnsType<IPost> = [
    {
      title: "User",
      dataIndex: "userId",
      render: (u) => (
        <Space>
          <Avatar src={u.avatar ? u.avatar : "/user/default-user.png"} />
          {u.name}
        </Space>
      ),
    },

    {
      title: "Nội dung",
      dataIndex: "content",
      width: 350,
      render: (text) => <span>{text.slice(0, 80)}...</span>,
    },

    // {
    //   title: "Media",
    //   dataIndex: "images",
    //   width: 160,
    //   render: (_, record) => {
    //     const { images, videos } = record;
    //     const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

    //     return (
    //       <Space>
    //         {images?.length > 0 && (
    //           <img
    //             src={`${baseURL}/post/images/${images[0]}`}
    //             style={{
    //               width: 60,
    //               height: 60,
    //               objectFit: "cover",
    //               borderRadius: 6,
    //               border: "1px solid #eee",
    //             }}
    //           />
    //         )}

    //         {videos?.length > 0 && (
    //           <video
    //             src={`${baseURL}/post/videos/${videos[0]}`}
    //             style={{
    //               width: 60,
    //               height: 60,
    //               borderRadius: 6,
    //             }}
    //           />
    //         )}

    //         {!images?.length && !videos?.length && <span>—</span>}
    //       </Space>
    //     );
    //   },
    // },

    {
      title: "Community",
      dataIndex: "communityId",
      render: (c) => (c ? c.name : "-"),
    },

    {
      title: "Likes",
      dataIndex: "likesCount",
      width: 80,
    },

    {
      title: "Comments",
      dataIndex: "commentsCount",
      width: 100,
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (v) =>
        new Date(v).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },

    {
      title: "Actions",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Xóa bài viết?"
          description="Bạn có chắc chắn muốn xóa bài viết này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(record._id)}
        >
          <DeleteOutlined
            style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Card className="admin-card">
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12} lg={8}>
            <label>Tìm kiếm:</label>
            <Input
              placeholder="Nhập tên post hoặc nội dung"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginTop: 5 }}
            />
          </Col>

          <Col
            xs={24}
            lg={8}
            style={{ display: "flex", alignItems: "end", gap: 10 }}
          >
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={fetchPosts}
            >
              Tìm kiếm
            </Button>

            <Button icon={<ReloadOutlined />} onClick={() => setSearchText("")}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title="Danh sách bài viết"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Tạo bài viết
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={posts}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <PostCreateModal
        open={openCreate}
        setOpen={setOpenCreate}
        token={session?.access_token ?? ""}
        onSuccess={fetchPosts}
      />
    </div>
  );
}
