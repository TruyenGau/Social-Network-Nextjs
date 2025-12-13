"use client";

import { Modal, Form, Input, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { sendRequest } from "@/utils/api";
import { useEffect, useState } from "react";

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  token: string;
  onSuccess: () => void;
}

export default function PostCreateModal({
  open,
  setOpen,
  token,
  onSuccess,
}: IProps) {
  const [form] = Form.useForm();

  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    const res = await sendRequest<any>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities?limit=100`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    setCommunities(
      res?.data?.result?.map((c: any) => ({
        label: c.name,
        value: c._id,
      })) ?? []
    );
  };

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();

      const body = {
        namePost: values.namePost,
        content: values.content,
        communityId: values.communityId || null,
        images: [],
        videos: [],
      };

      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/posts`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (res.data) {
        message.success("Tạo bài viết thành công!");
        form.resetFields();
        setOpen(false);
        onSuccess();
      }
    } catch (e) {
      message.error("Không thể tạo bài viết");
    }
  };

  return (
    <Modal
      title="Tạo bài viết"
      open={open}
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      okText="Đăng bài"
      cancelText="Hủy"
      width={700}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Tiêu đề" name="namePost" rules={[{ required: true }]}>
          <Input placeholder="Nhập tiêu đề bài viết..." />
        </Form.Item>

        <Form.Item label="Nội dung" name="content" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Nhập nội dung..." />
        </Form.Item>

        <Form.Item label="Community" name="communityId">
          <Select
            allowClear
            placeholder="Chọn community"
            options={communities}
          />
        </Form.Item>

        <Form.Item label="Ảnh (optional)">
          <Upload>
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
