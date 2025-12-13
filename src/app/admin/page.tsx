import { Card, Col, Row, Statistic } from "antd";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { sendRequest } from "@/utils/api";
import Dashboard from "@/components/admin/dasboard/dasboard.home";

export default async function DashboardPage() {
  return <Dashboard />;
}
