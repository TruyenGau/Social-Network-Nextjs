import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  permissions: string;
  online: string;
  type: string;
  avatar: string;
  coverPhoto: string;
  age: number;
  communities: string[];
  avatar: string;
  coverPhoto;
  school: string;
  description: string;
  work: string;
  address: string;
  createdAt: string;
  phoneNumber: string;
  gender: string;
  followingCount: number;
  followersCount: number;
  birthday: string | null;
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    access_token: string;
    refresh_token: string;
    user: IUser;
  }
}

declare module "next-auth" {
  interface Session {
    access_token: string;
    refresh_token: string;
    user: IUser;
  }
}
