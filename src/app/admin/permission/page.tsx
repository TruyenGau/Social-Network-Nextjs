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
import PermissionCreateModal from "@/components/admin/permission/permission.create";

interface IPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export default function PermissionPage() {
  const { data: session } = useSession();

  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchApi, setSearchApi] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editPermission, setEditPermission] = useState<IPermission | null>(
    null
  );

  // =====================================
  // FETCH LIST — dùng API mới
  // =====================================
  const fetchPermissions = async () => {
    if (!session?.access_token) return;

    setLoading(true);

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/permissions`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: {
        current: page,
        pageSize,
        name: searchName || undefined,
        apiPath: searchApi || undefined,
        sort: "-createdAt",
      },
    });

    const meta = res?.data?.meta;
    const result = res?.data?.result;

    setPermissions(result ?? []);
    setTotal(meta?.total ?? 0);
    setPage(meta?.current ?? 1);
    setPageSize(meta?.pageSize ?? 10);

    setLoading(false);
  };

  useEffect(() => {
    fetchPermissions();
  }, [session, page, pageSize]);

  // =====================================
  // DELETE
  // =====================================
  const handleDelete = async (id: string) => {
    try {
      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/permissions/${id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res?.data) {
        message.success("Xóa quyền thành công!");
        fetchPermissions();
      }
    } catch (e) {
      message.error("Không thể xóa quyền!");
    }
  };

  // =====================================
  // TABLE COLUMNS
  // =====================================
  const columns: ColumnsType<IPermission> = [
    {
      title: "Id",
      dataIndex: "_id",
      width: 220,
      render: (text) => (
        <a style={{ color: "#1677ff" }} onClick={() => {}}>
          {text}
        </a>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "API",
      dataIndex: "apiPath",
    },
    {
      title: "Method",
      dataIndex: "method",
      render: (method: string) => {
        const color =
          method === "GET"
            ? "blue"
            : method === "POST"
            ? "green"
            : method === "PATCH"
            ? "orange"
            : "red";

        return <span style={{ color, fontWeight: "bold" }}>{method}</span>;
      },
    },
    {
      title: "Module",
      dataIndex: "module",
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
              setEditPermission(record);
              setOpenModal(true);
            }}
          />

          <Popconfirm
            title="Xóa quyền?"
            description="Bạn chắc chắn muốn xóa permission này?"
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

          <Col xs={24} md={12} lg={8}>
            <label>API:</label>
            <Input
              placeholder="nhập dữ liệu"
              value={searchApi}
              onChange={(e) => setSearchApi(e.target.value)}
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
              onClick={fetchPermissions}
            >
              Tìm kiếm
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchApi("");
                setSearchName("");
                fetchPermissions();
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card
        title="Danh sách Permissions (Quyền Hạn)"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditPermission(null);
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
          dataSource={permissions}
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
      <PermissionCreateModal
        open={openModal}
        setOpen={setOpenModal}
        token={session?.access_token || ""}
        onSuccess={fetchPermissions}
        permission={editPermission} // 👈 thêm dòng này
      />
    </div>
  );
}
