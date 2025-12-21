"use client";

import { useEffect, useState } from "react";
import { Card, Table, Tag, Space, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, WarningOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { useToast } from "@/utils/toast";

/* =========================
 * TYPES
 * ========================= */
interface ISpamWarning {
  _id: string;
  message: string;
  createdAt: string;
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function SpamWarningsPage() {
  const { data: session } = useSession();
  const toast = useToast();

  const [warnings, setWarnings] = useState<ISpamWarning[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================
   * FETCH WARNINGS
   * ========================= */
  const fetchWarnings = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me/spam-warnings`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    console.log("res", res);
    if (res?.data) {
      setWarnings(res.data.warnings ?? []);
    } else {
      toast.error("Không thể tải danh sách cảnh cáo");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.access_token) fetchWarnings();
  }, [session]);

  /* =========================
   * TABLE COLUMNS
   * ========================= */
  const columns: ColumnsType<ISpamWarning> = [
    {
      title: "Nội dung cảnh cáo",
      dataIndex: "message",
      render: (v: string) => (
        <Space>
          <WarningOutlined style={{ color: "#faad14" }} />
          <span>{v}</span>
        </Space>
      ),
    },

    {
      title: "Admin xử lý",
      dataIndex: "adminId",
      width: 220,
      render: (admin) =>
        admin ? (
          <>
            <div style={{ fontWeight: 500 }}>{admin.name}</div>
            <small style={{ color: "#888" }}>{admin.email}</small>
          </>
        ) : (
          <span style={{ color: "#999" }}>Hệ thống</span>
        ),
    },

    {
      title: "Thời gian",
      dataIndex: "createdAt",
      width: 180,
      render: (v: string) => new Date(v).toLocaleString("vi-VN"),
    },
  ];

  /* =========================
   * RENDER
   * ========================= */
  return (
    <Card
      title="Lịch sử cảnh cáo"
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchWarnings}>
          Làm mới
        </Button>
      }
    >
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={warnings}
        loading={loading}
        pagination={{ pageSize: 5 }}
        locale={{
          emptyText: "Bạn chưa có cảnh cáo nào 🎉",
        }}
      />
    </Card>
  );
}
