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
  Tag,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import type { ColumnsType } from "antd/es/table";
import RoleModal from "@/components/admin/role/role.modal";

interface IRole {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function RolePage() {
  const { data: session } = useSession();

  const [roles, setRoles] = useState<IRole[]>([]);
  const [searchName, setSearchName] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editRole, setEditRole] = useState<IRole | null>(null);

  // ============================
  // FETCH ROLES
  // ============================
  const fetchRoles = async () => {
    if (!session?.access_token) return;

    setLoading(true);

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roles`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: {
        current: page,
        pageSize,
        name: searchName || undefined,
        sort: "-createdAt",
      },
    });

    const meta = res?.data?.meta;
    const result = res?.data?.result;

    setRoles(result ?? []);
    setTotal(meta?.total ?? 0);
    setPage(meta?.current ?? 1);
    setPageSize(meta?.pageSize ?? 10);

    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, [session, page, pageSize]);

  // ============================
  // DELETE ROLE
  // ============================
  const handleDelete = async (id: string) => {
    try {
      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roles/${id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res?.data) {
        message.success("Xóa role thành công!");
        fetchRoles();
      }
    } catch (e) {
      message.error("Không thể xóa role!");
    }
  };

  // ============================
  // TABLE COLUMNS
  // ============================
  const columns: ColumnsType<IRole> = [
    {
      title: "Id",
      dataIndex: "_id",
      width: 220,
      render: (text) => <a style={{ color: "#1677ff" }}>{text}</a>,
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">ACTIVE</Tag>
        ) : (
          <Tag color="red">INACTIVE</Tag>
        ),
    },
    {
      title: "CreatedAt",
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
      title: "UpdatedAt",
      dataIndex: "updatedAt",
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
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <EditOutlined
            style={{ color: "#faad14", fontSize: 18 }}
            onClick={() => {
              setEditRole(record);
              setOpenModal(true);
            }}
          />

          <Popconfirm
            title="Xóa role?"
            description="Bạn chắc chắn muốn xóa vai trò này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
          >
            <DeleteOutlined
              style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      {/* SEARCH */}
      <Card className="admin-card">
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12} lg={8}>
            <label>Name:</label>
            <Input
              placeholder="nhập dữ liệu"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </Col>

          <Col
            xs={24}
            md={12}
            lg={8}
            style={{ display: "flex", alignItems: "end", gap: 10 }}
          >
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchRoles}
            >
              Tìm kiếm
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchName("");
                fetchRoles();
              }}
            >
              Làm lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card
        title="Danh sách Roles (Vai Trò)"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRole(null);
              setOpenModal(true);
            }}
          >
            Thêm mới
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={roles}
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

      {/* MODAL */}
      <RoleModal
        open={openModal}
        setOpen={setOpenModal}
        token={session?.access_token || ""}
        onSuccess={fetchRoles}
        role={editRole}
      />
    </div>
  );
}
