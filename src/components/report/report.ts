export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";

// ===== ACTION =====
export type ReportAction = "DELETE" | "WARNING" | "BAN" | "NONE";

export interface IReport {
  _id: string;

  reporterId: {
    _id: string;
    name: string;
    email: string;
  };

  targetType: ReportTargetType;

  targetId: string;

  reason: ReportReason;
  description?: string;

  status: ReportStatus;
  action: ReportAction;

  adminId?: {
    _id: string;
    name: string;
    email: string;
  };

  createdAt: string;
  updatedAt: string;
}
export type ReportTargetType = "POST" | "USER";

// ===== REASON =====
export type ReportReason = "OFFENSIVE_LANGUAGE" | "VIOLENCE" | "SPAM" | "OTHER";

// ===== STATUS =====
export interface ICreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}
export interface ICreateReportResponse {
  success: boolean;
  report: IReport;
}
export type IGetReportsResponse = IReport[];

export interface IResolveReportPayload {
  action: ReportAction;
}

export interface IResolveReportResponse {
  success: boolean;
  message: string;
}

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  OFFENSIVE_LANGUAGE: "Ngôn từ xúc phạm",
  VIOLENCE: "Nội dung bạo lực / nhạy cảm",
  SPAM: "Spam / Quảng cáo",
  OTHER: "Lý do khác",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "Chờ xử lý",
  RESOLVED: "Đã xử lý",
  REJECTED: "Bị từ chối",
};

export const REPORT_ACTION_LABEL: Record<ReportAction, string> = {
  DELETE: "Xóa nội dung",
  WARNING: "Cảnh cáo",
  BAN: "Khóa tài khoản",
  NONE: "Không xử lý",
};
