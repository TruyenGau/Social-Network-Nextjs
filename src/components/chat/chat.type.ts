export type RoomType = "private" | "group";

export interface IRoomMember {
  _id: string;
  email?: string; // ✅ optional cho cả project
  name: string;
  avatar?: string;
}

export interface IRoom {
  _id: string;
  type: RoomType;
  name?: string;
  members: IRoomMember[];
}
