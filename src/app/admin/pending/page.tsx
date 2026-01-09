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
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { sendRequest } from "@/utils/api";
import { Line, Pie } from "@ant-design/plots";

import { IAdminPost } from "./admin-post";

/* =========================
 * PAGE
 * ========================= */
export default function AdminPendingPostsPage() {
  const { data: session } = useSession();

  const [posts, setPosts] = useState<IAdminPost[]>([]);
  const [loading, setLoading] = useState(false);

  // 📈 % bài bị AI chặn theo ngày
  const [aiRate, setAiRate] = useState<any[]>([]);

  // 🎯 Độ chính xác AI
  const [aiAccuracy, setAiAccuracy] = useState<{
    correct: number;
    falsePositive: number;
  }>({ correct: 0, falsePositive: 0 });

  /* =========================
   * FETCH PENDING POSTS
   * ========================= */
  const fetchPendingPosts = async () => {
    if (!session?.access_token) return;

    setLoading(true);

    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/admin/pending`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const data: IAdminPost[] = res?.data ?? [];
    setPosts(data);
    calculateAiAccuracy(data);
    setLoading(false);
  };

  /* =========================
   * FETCH AI RATE (DAY)
   * ========================= */
  const fetchAiRate = async () => {
    if (!session?.access_token) return;

    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/admin/stats/ai-rate`,
      method: "GET",
      headers: { Authorization: `Bearer ${session.access_token}` },
      queryParams: { type: "day" },
    });

    setAiRate(Array.isArray(res?.data) ? res.data : []);
  };

  /* =========================
   * AI ACCURACY CALC
   * ========================= */
  const calculateAiAccuracy = (data: IAdminPost[]) => {
    const flagged = data.filter((p) => p.aiFlag);
    const falsePositive = flagged.filter((p) => p.status === "APPROVED");

    setAiAccuracy({
      correct: flagged.length - falsePositive.length,
      falsePositive: falsePositive.length,
    });
  };

  useEffect(() => {
    if (!session?.access_token) return;
    fetchPendingPosts();
    fetchAiRate();
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
      message.error("Xử lý thất bại");
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
      render: (v: string) => (v ? <Tooltip title={v}>{v}</Tooltip> : "—"),
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
      render: (v) =>
        v ? <Tag color="red">AI FLAG</Tag> : <Tag color="green">OK</Tag>,
    },
    {
      title: "AI Reason",
      dataIndex: "aiReason",
      render: (v) => (v ? <Tooltip title={v}>{v}</Tooltip> : "—"),
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
            title="Xóa bài viết?"
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
   * CHART CONFIG
   * ========================= */

  // 📈 Line chart
  const lineConfig = {
    data: aiRate,
    xField: "time",
    yField: "percent",
    smooth: true,
    yAxis: {
      label: {
        formatter: (v: number) => `${v}%`,
      },
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: "AI chặn",
        value: `${datum.percent}%`,
      }),
    },
  };

  // 🎯 Pie chart
  /* =========================
   * PIE CONFIG (SAFE)
   * ========================= */

  /* =========================
   * PIE CONFIG (100% SAFE)
   * ========================= */

  const pieData = [
    { type: "AI chặn đúng", value: aiAccuracy.correct },
    { type: "AI chặn sai", value: aiAccuracy.falsePositive },
  ];

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 0.9,

    // ❌ KHÔNG DÙNG label (nguyên nhân gây crash)

    tooltip: {
      formatter: (datum: any) => {
        const total = aiAccuracy.correct + aiAccuracy.falsePositive || 1;
        const percent = ((datum.value / total) * 100).toFixed(1);
        return {
          name: datum.type,
          value: `${datum.value} (${percent}%)`,
        };
      },
    },

    legend: {
      position: "bottom",
    },

    interactions: [{ type: "element-active" }],
  };

  /* =========================
   * RENDER
   * ========================= */
  return (
    <>
      {/* ===== TABLE ===== */}
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

      {/* ===== DASHBOARD ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="📈 % Bài viết bị AI chặn theo ngày">
            <Line {...lineConfig} />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="🎯 Độ chính xác AI">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
