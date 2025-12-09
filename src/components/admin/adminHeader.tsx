"use client";

import { Layout, Avatar } from "antd";

export default function AdminHeader() {
  return (
    <Layout.Header
      style={{
        background: "#fff",
        padding: "0 20px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        borderBottom: "1px solid #eee",
      }}
    >
      <span style={{ marginRight: 10 }}>Welcome Im admin</span>
      <Avatar>IM</Avatar>
    </Layout.Header>
  );
}
