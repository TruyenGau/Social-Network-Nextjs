"use client";

import { Card, Col, Row, Statistic } from "antd";
import { useEffect, useState } from "react";

import { sendRequest } from "@/utils/api";
import { useSession } from "next-auth/react";
// import DashboardBarChart from "./dasboard.chart";
// import DashboardChart from "./dasboard.chart";

export default function Dashboard() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = async () => {
    if (!session?.access_token) return;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts/summary`,
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    console.log("check res", res);

    setSummary(res?.data || null);
  };

  useEffect(() => {
    fetchSummary();
  }, [session]);

  if (!summary) return <div>Đang tải dữ liệu...</div>;

  const cards = [
    { title: "Tổng số User", value: summary.totals.users },
    { title: "Tổng số Post", value: summary.totals.posts },
    { title: "Tổng số Community", value: summary.totals.communities },
  ];

  return (
    <div>
      {/* SUMMARY CARDS */}
      <Row gutter={[20, 20]}>
        {cards.map((item, idx) => (
          <Col span={24} md={8} key={idx}>
            <Card title={item.title} variant="borderless">
              <Statistic value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* BIỂU ĐỒ */}
      {/* <div className="mt-6">
        <DashboardBarChart
          usersByMonth={summary.usersByMonth}
          postsByMonth={summary.postsByMonth}
        />
      </div> */}
    </div>
  );
}
