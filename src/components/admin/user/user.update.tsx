"use client";

import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { IUser } from "@/types/next-auth";
import { sendRequest } from "@/utils/api";

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  user: IUser | null;
  token: string;
  onSuccess: () => void;
}

export default function UserUpdateModal({
  open,
  setOpen,
  user,
  token,
  onSuccess,
}: IProps) {
  const [form] = Form.useForm();

  // 🔥 Khi open modal → fill dữ liệu user vào form
  console.log("check user", user);
  if (user) {
    form.setFieldsValue({
      name: user.name,
      age: user.age,
      gender: user.gender,
      work: user.work,
      school: user.school,
      description: user.description,
      phoneNumber: user.phoneNumber,
      address: user.address,
      birthday: user.birthday ? dayjs(user.birthday) : null,
    });
  }

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();

      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          ...values,
          email: user!.email,
          _id: user!._id,
          role: user?.role,
          birthday: values.birthday ? values.birthday.toISOString() : null,
        },
      });

      if (res?.data) {
        message.success("Cập nhật thành công!");
        onSuccess();
        setOpen(false);
      }
      console.log("check submit", res.data);
    } catch (err) {
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <Modal
      title="Cập nhật User"
      open={open}
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      width={800}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="Tên" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Tuổi" name="age">
          <Input />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input />
        </Form.Item>

        <Form.Item label="Trường học" name="school">
          <Input />
        </Form.Item>

        <Form.Item label="Công việc" name="work">
          <Input />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender">
          <Select
            options={[
              { value: "MALE", label: "Nam" },
              { value: "FEMALE", label: "Nữ" },
              { value: "OTHER", label: "Khác" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phoneNumber">
          <Input />
        </Form.Item>

        <Form.Item label="Ngày sinh" name="birthday">
          <DatePicker format={"DD/MM/YYYY"} />
        </Form.Item>

        <Form.Item label="Mô tả bản thân" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
