"use client";

import { Card, Row, Col } from "antd";
import { Column } from "@ant-design/charts";

interface IProps {
  usersByMonth: { month: string; count: number }[];
  postsByMonth: { month: string; count: number }[];
}

export default function DashboardBarChart({
  usersByMonth,
  postsByMonth,
}: IProps) {
  const userConfig = {
    data: usersByMonth,
    xField: "month",
    yField: "count",
    height: 350,
    color: ({ month }: any) => {
      const colors: Record<string, string> = {
        Jan: "#1677ff",
        Feb: "#69b1ff",
        Mar: "#91caff",
        Dec: "#0958d9",
      };
      return colors[month] || "#1677ff";
    },
  };

  const postConfig = {
    data: postsByMonth,
    xField: "month",
    yField: "count",
    height: 350,
    color: ({ month }: any) => {
      const colors: Record<string, string> = {
        Jan: "#52c41a",
        Feb: "#95de64",
        Mar: "#b7eb8f",
        Dec: "#389e0d",
      };
      return colors[month] || "#52c41a";
    },
  };

  return (
    <Row gutter={[20, 20]}>
      <Col xs={24} md={12}>
        <Card title="Biểu đồ số lượng User theo tháng">
          <Column {...userConfig} />
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card title="Biểu đồ số lượng Post theo tháng">
          <Column {...postConfig} />
        </Card>
      </Col>
    </Row>
  );
}
