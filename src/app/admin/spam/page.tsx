"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Card,
  Select,
  Tooltip,
  Modal,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, WarningOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

/* =========================
 * TYPES
 * ========================= */
export interface ISpamUser {
  _id: string;
  name: string;
  email: string;
  spamScore: number;
  spamReason: string | null;
  block: boolean;
  createdAt: string;
}

export type SpamAction = "WARN" | "BLOCK" | "UNBLOCK" | "RESET";

export default function SpamUsersAdminPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [users, setUsers] = useState<ISpamUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedActions, setSelectedActions] = useState<
    Record<string, SpamAction | undefined>
  >({});

  /* =========================
   * WARN MODAL STATE
   * ========================= */
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* =========================
   * FETCH SPAM USERS
   * ========================= */
  const fetchSpamUsers = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/all-user/spam-suspected`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setUsers(res?.data?.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.access_token) fetchSpamUsers();
  }, [session]);

  /* =========================
   * HANDLE ACTION
   * ========================= */
  const handleAction = async (
    userId: string,
    action: SpamAction,
    message?: string
  ) => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/all-user/spam-handle/${userId}`,
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { action, message },
    });
    console.log(res);

    if (res?.data?.success) {
      toast.success(res.data.message);
      setSelectedActions((prev) => ({ ...prev, [userId]: undefined }));
      fetchSpamUsers();
    } else {
      toast.error(res?.data?.message || "Xử lý thất bại");
    }
  };

  /* =========================
   * TABLE COLUMNS
   * ========================= */
  const columns: ColumnsType<ISpamUser> = [
    {
      title: "User",
      render: (_, record) => (
        <>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <small style={{ color: "#888" }}>{record.email}</small>
        </>
      ),
    },

    {
      title: "Spam Score",
      dataIndex: "spamScore",
      render: (v: number) => (
        <Tag color={v >= 200 ? "red" : v >= 100 ? "orange" : "gold"}>{v}</Tag>
      ),
    },

    {
      title: "Lý do",
      dataIndex: "spamReason",
      ellipsis: true,
      render: (v?: string | null) =>
        v ? (
          <Tooltip title={v}>
            <span>{v}</span>
          </Tooltip>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        ),
    },

    {
      title: "Trạng thái",
      dataIndex: "block",
      render: (v: boolean) =>
        v ? <Tag color="red">Đã khóa</Tag> : <Tag color="green">Hoạt động</Tag>,
    },

    {
      title: "Xử lý",
      width: 340,
      render: (_, record) => (
        <Space>
          <Select
            placeholder="Chọn hành động"
            style={{ width: 170 }}
            value={selectedActions[record._id]}
            onChange={(value: SpamAction) => {
              setSelectedActions((prev) => ({
                ...prev,
                [record._id]: value,
              }));

              if (value === "WARN") {
                setCurrentUserId(record._id);
                setWarnModalOpen(true);
              }
            }}
          >
            <Select.Option value="WARN">Cảnh cáo</Select.Option>

            <Select.Option value="BLOCK" disabled={record.block}>
              Khóa tài khoản
            </Select.Option>

            <Select.Option value="UNBLOCK" disabled={!record.block}>
              Mở khóa
            </Select.Option>

            <Select.Option value="RESET">Bỏ nghi ngờ</Select.Option>
          </Select>

          <Popconfirm
            title="Xác nhận xử lý user?"
            okText="Xác nhận"
            cancelText="Hủy"
            disabled={
              !selectedActions[record._id] ||
              selectedActions[record._id] === "WARN"
            }
            onConfirm={() =>
              handleAction(record._id, selectedActions[record._id]!)
            }
          >
            <Button
              type="primary"
              danger={selectedActions[record._id] === "BLOCK"}
              disabled={
                !selectedActions[record._id] ||
                selectedActions[record._id] === "WARN"
              }
              icon={<WarningOutlined />}
            >
              OK
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
    <>
      <Card
        title="User nghi ngờ spam (Hệ thống tự phát hiện)"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchSpamUsers}>
            Refresh
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* =========================
       * WARN MODAL
       * ========================= */}
      <Modal
        title="Nhập nội dung cảnh cáo"
        open={warnModalOpen}
        okText="Cảnh cáo"
        cancelText="Hủy"
        onCancel={() => {
          setWarnModalOpen(false);
          setWarnMessage("");
          setCurrentUserId(null);
        }}
        onOk={() => {
          if (!warnMessage.trim() || !currentUserId) {
            toast.error("Vui lòng nhập nội dung cảnh cáo");
            return;
          }

          handleAction(currentUserId, "WARN", warnMessage);
          setWarnModalOpen(false);
          setWarnMessage("");
          setCurrentUserId(null);
        }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập nội dung cảnh cáo cho user..."
          value={warnMessage}
          onChange={(e) => setWarnMessage(e.target.value)}
        />
      </Modal>
    </>
  );
}
