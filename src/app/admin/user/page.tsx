"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
  Input,
  Card,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import type { ColumnsType } from "antd/es/table";
import { IUser } from "@/types/next-auth";
import UserDetail from "@/components/admin/user/user.detail";
import UserUpdateModal from "@/components/admin/user/user.update";
import UserCreateModal from "@/components/admin/user/user.create";

interface IUserPageRes {
  result: IUser[];
  meta: { current: number; pageSize: number; total: number };
}

export default function UserPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { data: session } = useSession();

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchUsers = async () => {
    if (!session?.access_token)
      return { result: [], meta: { total: 0, current: 1, pageSize: 10 } };

    const res = await sendRequest<IBackendRes<IUserPageRes>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: {
        current: page,
        pageSize,
        sort: "-createdAt",

        // 🔥 Đây là MẤU CHỐT GIỐNG REACT – backend aqp đọc được
        name: searchName ? `/${searchName}/i` : undefined,
        email: searchEmail ? `/${searchEmail}/i` : undefined,
      },
    });

    return {
      result: res?.data?.result || [],
      meta: res?.data?.meta || { total: 0, current: 1, pageSize: 10 },
    };
  };

  const loadUsers = async () => {
    setLoading(true);
    const { result, meta } = await fetchUsers();
    setUsers(result);
    setTotal(meta.total);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.access_token) loadUsers();
  }, [session, page, pageSize]);

  const columns: ColumnsType<IUser> = [
    {
      title: "Id",
      dataIndex: "_id",
      render: (_: any, record: IUser) => (
        <a
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => {
            setSelectedUser(record);
            setOpenDetail(true);
          }}
        >
          {record._id}
        </a>
      ),
    },

    { title: "Name", dataIndex: "name", sorter: true },
    { title: "Email", dataIndex: "email", sorter: true },

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
      width: 120,
      align: "center",
      render: (_: any, record: IUser) => (
        <Space>
          <EditOutlined
            style={{ color: "#faad14", fontSize: 18, cursor: "pointer" }}
            onClick={() => {
              setSelectedUser(record);
              setOpenUpdate(true);
            }}
          />

          <Popconfirm
            title="Xác nhận xóa user"
            description="Bạn có chắc chắn muốn xóa user này ?"
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() => handleDeleteUser(record._id)}
          >
            <DeleteOutlined
              style={{ color: "#ff4d4f", fontSize: 18, cursor: "pointer" }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleReset = () => {
    setSearchName("");
    setSearchEmail("");
    setPage(1);
    loadUsers();
  };

  const handleDeleteUser = async (_id: string) => {
    try {
      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${_id}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res?.data) {
        message.success("Xóa user thành công");
        loadUsers(); // reload lại danh sách
      }
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  return (
    <div className="admin-container">
      <Card className="admin-card">
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12} lg={8}>
            <label>Name :</label>
            <Input
              placeholder="nhập dữ liệu"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ marginTop: 5 }}
            />
          </Col>

          <Col xs={24} md={12} lg={8}>
            <label>Email :</label>
            <Input
              placeholder="nhập dữ liệu"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
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
              onClick={loadUsers}
            >
              Tìm kiếm
            </Button>

            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Làm lại
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title="Danh sách Users"
        className="admin-card"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpenCreate(true)}
            >
              Thêm mới
            </Button>

            <Button icon={<ReloadOutlined />} onClick={loadUsers} />

            <Button icon={<SettingOutlined />} />
          </Space>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên ${total} rows`,
          }}
        />
      </Card>
      <UserDetail
        open={openDetail}
        setOpen={setOpenDetail}
        user={selectedUser}
      />
      <UserUpdateModal
        open={openUpdate}
        setOpen={setOpenUpdate}
        user={selectedUser}
        token={session?.access_token ?? ""}
        onSuccess={loadUsers}
      />
      <UserCreateModal
        open={openCreate}
        setOpen={setOpenCreate}
        token={session?.access_token ?? ""}
        onSuccess={loadUsers}
      />
    </div>
  );
}
