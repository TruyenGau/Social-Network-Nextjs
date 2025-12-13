"use client";

import {
  Modal,
  Form,
  Input,
  Switch,
  Collapse,
  Card,
  Row,
  Col,
  message,
  Divider,
} from "antd";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";

const { Panel } = Collapse;

interface IPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  token: string;
  onSuccess: () => void;
  role?: any; // nếu edit thì có dữ liệu role
}

export default function RoleModal({
  open,
  setOpen,
  token,
  onSuccess,
  role,
}: IProps) {
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  // ===========================
  // FETCH PERMISSIONS
  // ===========================
  const fetchPermissions = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/permissions`,
      method: "GET",
      queryParams: { pageSize: 999 },
      headers: { Authorization: `Bearer ${token}` },
    });

    setPermissions(res?.data?.result || []);
  };

  // ===========================
  // Khi mở modal → set dữ liệu edit
  // ===========================
  useEffect(() => {
    fetchPermissions();

    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      });
      setSelectedPerms(role.permissions || []);
    } else {
      form.resetFields();
      setSelectedPerms([]);
    }
  }, [role, open]);

  // ===========================
  // Toggle 1 permission
  // ===========================
  const togglePermission = (permId: string, checked: boolean) => {
    if (checked) {
      setSelectedPerms([...selectedPerms, permId]);
    } else {
      setSelectedPerms(selectedPerms.filter((p) => p !== permId));
    }
  };

  // ===========================
  // Toggle theo module
  // ===========================
  const toggleModule = (moduleName: string, checked: boolean) => {
    const modulePerms = permissions
      .filter((p) => p.module === moduleName)
      .map((p) => p._id);

    if (checked) {
      // bật hết
      setSelectedPerms(Array.from(new Set([...selectedPerms, ...modulePerms])));
    } else {
      // tắt hết
      setSelectedPerms(selectedPerms.filter((id) => !modulePerms.includes(id)));
    }
  };

  // ===========================
  // SUBMIT FORM
  // ===========================
  const handleSubmit = async () => {
    const values = form.getFieldsValue();

    const body = {
      name: values.name,
      description: values.description,
      isActive: values.isActive,
      permissions: selectedPerms,
    };

    const isEdit = !!role;

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roles${
        isEdit ? `/${role._id}` : ""
      }`,
      method: isEdit ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    if (res?.data) {
      message.success(
        isEdit ? "Cập nhật role thành công!" : "Tạo role thành công!"
      );
      onSuccess();
      setOpen(false);
    } else {
      message.error("Thao tác thất bại!");
    }
  };

  // ===============================
  // GROUP permissions by module
  // ===============================
  const moduleGroups = permissions.reduce((acc, perm) => {
    acc[perm.module] = acc[perm.module] || [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, IPermission[]>);

  return (
    <Modal
      title={role ? "Cập nhật Role" : "Tạo mới Role"}
      open={open}
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      okText={role ? "Cập nhật" : "Tạo mới"}
      width={900}
    >
      <Form form={form} layout="vertical">
        <Row gutter={20}>
          <Col span={16}>
            <Form.Item
              label="* Tên Role"
              name="name"
              rules={[{ required: true, message: "Nhập tên role!" }]}
            >
              <Input placeholder="Nhập tên role" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="* Miêu tả" name="description">
          <Input.TextArea placeholder="Nhập miêu tả role" rows={3} />
        </Form.Item>

        <Divider />

        <h3>Quyền hạn · Các quyền được phép cho role này</h3>

        <Collapse accordion>
          {Object.keys(moduleGroups).map((moduleName) => {
            const modulePerms = moduleGroups[moduleName];
            const allChecked = modulePerms.every((p) =>
              selectedPerms.includes(p._id)
            );

            return (
              <Panel
                header={
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>{moduleName}</strong>
                    <Switch
                      checked={allChecked}
                      onChange={(c) => toggleModule(moduleName, c)}
                    />
                  </div>
                }
                key={moduleName}
              >
                <Row gutter={[10, 10]}>
                  {modulePerms.map((perm) => (
                    <Col span={12} key={perm._id}>
                      <Card size="small" bordered>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <strong>{perm.name}</strong>
                            <br />
                            <span
                              style={{
                                color:
                                  perm.method === "GET"
                                    ? "blue"
                                    : perm.method === "POST"
                                    ? "green"
                                    : perm.method === "PATCH"
                                    ? "orange"
                                    : "red",
                                fontWeight: "bold",
                              }}
                            >
                              {perm.method}
                            </span>{" "}
                            <span>{perm.apiPath}</span>
                          </div>

                          <Switch
                            checked={selectedPerms.includes(perm._id)}
                            onChange={(c) => togglePermission(perm._id, c)}
                          />
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Panel>
            );
          })}
        </Collapse>
      </Form>
    </Modal>
  );
}
