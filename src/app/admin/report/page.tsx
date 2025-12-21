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
  Select,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";

import type {
  IReport,
  ReportAction,
  ReportStatus,
  ReportReason,
} from "./report";

import {
  REPORT_REASON_LABEL,
  REPORT_STATUS_LABEL,
  REPORT_ACTION_LABEL,
} from "./report";
import ReportTargetDrawer from "@/components/report/report.detail";

export default function ReportAdminPage() {
  const { data: session } = useSession();

  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ReportStatus | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"POST" | "USER">("POST");
  const [drawerData, setDrawerData] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // ⭐ lưu action đang chọn theo reportId
  const [selectedActions, setSelectedActions] = useState<
    Record<string, ReportAction | undefined>
  >({});

  /* =========================
   * FETCH REPORTS
   * ========================= */
  const fetchReports = async () => {
    if (!session?.access_token) return;

    setLoading(true);

    const res = await sendRequest<IBackendRes<IReport[]>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reports`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: status ? { status } : {},
    });

    setReports(res?.data ?? []);
    setLoading(false);
  };
  console.log("session", session?.user.block);

  useEffect(() => {
    if (session?.access_token) fetchReports();
  }, [session, status]);

  /* =========================
   * RESOLVE REPORT
   * ========================= */
  const handleResolve = async (reportId: string, action: ReportAction) => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reports/${reportId}/resolve`,
      method: "PATCH",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: { action },
    });

    if (res?.data?.success) {
      message.success("Đã xử lý report");
      setSelectedActions((prev) => ({ ...prev, [reportId]: undefined }));
      fetchReports();
    } else {
      message.error(res?.data?.message || "Xử lý thất bại");
    }
  };
  const openTargetDetail = async (type: "POST" | "USER", targetId: string) => {
    if (!session?.access_token) return;

    setDrawerType(type);
    setDrawerOpen(true);
    setDrawerLoading(true);

    const url =
      type === "POST"
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/${targetId}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/${targetId}`;

    const res = await sendRequest<any>({
      url,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setDrawerData(res?.data || null);
    setDrawerLoading(false);
  };

  /* =========================
   * TABLE COLUMNS
   * ========================= */
  const columns: ColumnsType<IReport> = [
    {
      title: "Người báo cáo",
      dataIndex: "reporterId",
      render: (u) => (
        <>
          <div style={{ fontWeight: 500 }}>{u.name}</div>
          <small style={{ color: "#888" }}>{u.email}</small>
        </>
      ),
    },

    {
      title: "Đối tượng",
      dataIndex: "targetType",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "ID đối tượng",
      dataIndex: "targetId",
      render: (id: string, record) => (
        <a
          style={{ color: "#1677ff" }}
          onClick={() => openTargetDetail(record.targetType, id)}
        >
          {id}
        </a>
      ),
    },

    {
      title: "Lý do",
      dataIndex: "reason",
      render: (v: ReportReason) => REPORT_REASON_LABEL[v],
    },

    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
      render: (v?: string) =>
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
      dataIndex: "status",
      render: (v: ReportStatus) => (
        <Tag color={v === "PENDING" ? "orange" : "green"}>
          {REPORT_STATUS_LABEL[v]}
        </Tag>
      ),
    },

    {
      title: "Admin xử lý",
      dataIndex: "adminId",
      render: (v) => v?.name || "—",
    },

    {
      title: "Hành động hiện tại",
      dataIndex: "action",
      render: (v: ReportAction) =>
        v !== "NONE" ? REPORT_ACTION_LABEL[v] : "—",
    },

    {
      title: "Xử lý",
      width: 300,
      render: (_, record) => (
        <Space>
          <Select
            placeholder="Chọn hành động"
            style={{ width: 150 }}
            value={selectedActions[record._id]}
            onChange={(value: ReportAction) =>
              setSelectedActions((prev) => ({
                ...prev,
                [record._id]: value,
              }))
            }
          >
            <Select.Option value="DELETE">Xóa nội dung</Select.Option>
            <Select.Option value="WARNING">Cảnh cáo</Select.Option>
            <Select.Option value="BAN">Khóa tài khoản</Select.Option>
            <Select.Option value="NONE">Bỏ qua</Select.Option>
          </Select>

          <Popconfirm
            title="Xác nhận xử lý report?"
            okText="Xác nhận"
            cancelText="Hủy"
            disabled={!selectedActions[record._id]}
            onConfirm={() =>
              handleResolve(record._id, selectedActions[record._id]!)
            }
          >
            <Button type="primary" disabled={!selectedActions[record._id]}>
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
    <Card
      title="Danh sách báo cáo vi phạm"
      extra={
        <Space>
          <Select
            value={status}
            style={{ width: 160 }}
            onChange={(v) => setStatus(v)}
            allowClear
            placeholder="Lọc trạng thái"
          >
            <Select.Option value="PENDING">Chờ xử lý</Select.Option>
            <Select.Option value="RESOLVED">Đã xử lý</Select.Option>
            <Select.Option value="REJECTED">Từ chối</Select.Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={fetchReports} />
        </Space>
      }
    >
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={reports}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <ReportTargetDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerData(null);
        }}
        type={drawerType}
        data={drawerData}
        loading={drawerLoading}
      />
    </Card>
  );
}
