export type PostStatus = "APPROVED" | "PENDING" | "REJECTED";

export interface IAdminPost {
  _id: string;
  content: string;
  images: string[];
  videos: string[];

  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  status: PostStatus;

  aiFlag: boolean;
  aiReason?: string;
  aiScore?: number;

  createdAt: string;
}
