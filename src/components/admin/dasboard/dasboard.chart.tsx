"use client";

import { Card, Row, Col } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface IProps {
  usersByMonth: { month: string; count: number }[];
  postsByMonth: { month: string; count: number }[];
}

export default function DashboardBarChart({
  usersByMonth,
  postsByMonth,
}: IProps) {
  return (
    <Row gutter={[20, 20]}>
      {/* ========================== */}
      {/* BIỂU ĐỒ USERS THEO THÁNG */}
      {/* ========================== */}
      <Col xs={24} md={12}>
        <Card title="Biểu đồ số lượng User theo tháng">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={usersByMonth}
              margin={{ top: 20, right: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1677ff" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      {/* ========================== */}
      {/* BIỂU ĐỒ POSTS THEO THÁNG */}
      {/* ========================== */}
      <Col xs={24} md={12}>
        <Card title="Biểu đồ số lượng Post theo tháng">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={postsByMonth}
              margin={{ top: 20, right: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#52c41a" name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}
