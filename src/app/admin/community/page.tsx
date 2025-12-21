"use client";

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
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import type { ColumnsType } from "antd/es/table";
import CommunityDetailDrawer from "@/components/admin/community/community.detail";
import CommunityCreateModal from "@/components/admin/community/community.create";

interface ICommunityPageRes {
  result: IGroups[];
  meta: { current: number; pageSize: number; total: number };
}

export default function CommunityPage() {
  const { data: session } = useSession();

  const [communities, setCommunities] = useState<IGroups[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  // ============================== FETCH LIST ==============================
  const fetchCommunities = async () => {
    if (!session?.access_token) return;

    setLoading(true);

    const res = await sendRequest<IBackendRes<ICommunityPageRes>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: {
        current: page,
        pageSize,
        name: searchName ? `/${searchName}/i` : undefined,
        sort: "-createdAt",
      },
    });

    setCommunities(res?.data?.result ?? []);
    setTotal(res?.data?.meta?.total ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunities();
  }, [session, page, pageSize]);

  // ============================== DELETE ==============================
  const handleDelete = async (_id: string) => {
    try {
      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities/${_id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res?.data) {
        message.success("Xóa community thành công!");
        fetchCommunities();
      }
    } catch (err) {
      message.error("Xóa community thất bại!");
    }
  };

  // ============================== COLUMNS ==============================
  const columns: ColumnsType<IGroups> = [
    {
      title: "Tên Group",
      dataIndex: "name",
      render: (text, record) => (
        <a
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => {
            setSelectedGroupId(record._id);
            setOpenDetail(true);
          }}
        >
          {text}
        </a>
      ),
    },

    {
      title: "Avatar",
      dataIndex: "avatar",
      render: (img: string) => <Avatar src={img} />,
    },

    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      width: 250,
    },

    {
      title: "Thành viên",
      dataIndex: "membersCount",
      width: 100,
    },

    {
      title: "Bài viết",
      dataIndex: "postsCount",
      width: 100,
    },

    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (v: string) =>
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
      width: 80,
      align: "center",
      render: (_, record) => (
        <div style={{ width: 40, display: "flex", justifyContent: "center" }}>
          <Popconfirm
            title="Xóa community?"
            description="Bạn có chắc chắn muốn xóa group này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
            placement="left" // ngăn tooltip đẩy layout
          >
            <DeleteOutlined
              style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-container">
      {/* SEARCH */}
      <Card className="admin-card">
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12} lg={8}>
            <label>Tìm kiếm theo tên:</label>
            <Input
              placeholder="Nhập tên community..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ marginTop: 5 }}
            />
          </Col>

          <Col
            xs={24}
            lg={8}
            style={{ display: "flex", alignItems: "end", gap: 10 }}
          >
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchCommunities}
            >
              Tìm kiếm
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchName("");
                fetchCommunities();
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card
        title="Danh sách Community"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenCreate(true)}
          >
            Tạo Nhóm Mới
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={communities}
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

      {/* DETAIL DRAWER */}
      <CommunityDetailDrawer
        open={openDetail}
        setOpen={setOpenDetail}
        groupId={selectedGroupId}
      />
      <CommunityCreateModal
        open={openCreate}
        setOpen={setOpenCreate}
        token={session?.access_token ?? ""}
        onSuccess={fetchCommunities}
      />
    </div>
  );
}
