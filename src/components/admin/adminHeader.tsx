"use client";

import { Layout, Avatar, Dropdown, MenuProps } from "antd";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminHeader() {
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <a href="/">Trang chủ</a>,
    },
    {
      key: "2",
      // gọi signOut() khi click
      label: (
        <span
          onClick={() => {
            signOut();
            redirect("/auth/signin");
          }}
          style={{ color: "red" }}
        >
          Đăng xuất
        </span>
      ),
    },
  ];

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

      {/* DROPDOWN */}
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
        <Avatar style={{ cursor: "pointer" }}>IM</Avatar>
      </Dropdown>
    </Layout.Header>
  );
}
