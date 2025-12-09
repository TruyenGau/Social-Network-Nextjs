import { Card, Col, Row, Statistic } from "antd";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  console.log("check session", session);
  return (
    <Row gutter={[20, 20]}>
      {[1, 2, 3].map((_, idx) => (
        <Col span={24} md={8} key={idx}>
          <Card title="Card title" variant="borderless">
            <Statistic title="Active Users" value={112893} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
