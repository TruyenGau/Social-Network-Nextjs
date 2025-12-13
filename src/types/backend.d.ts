export {};
// https://bobbyhadz.com/blog/typescript-make-types-global#declare-global-types-in-typescript

declare global {
  interface IRequest {
    url: string;
    method: string;
    body?: { [key: string]: any };
    queryParams?: any;
    useCredentials?: boolean;
    headers?: any;
    nextOption?: any;
  }

  interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface IPost {
    _id: string;
    namePost: string;
    content: string;
    images: string[];
    videos: string[];
    userId: {
      name: string;
      avatar: string;
      _id: string;
    };
    likesCount: number;
    commentsCount: number;
    createdBy: {
      _id: string;
      email: string;
    };

    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    isLiked: boolean;
    communityId: {
      _id: string;
      name: string;
      avatar: string;
    };
    isSaved: boolean;
  }

  interface IAuthUser {
    access_token: string;
    refresh_token: string;
    user: IUser;
  }

  interface IContext {
    userInfoId?: string;
    setUserInfoId: (v: string) => void;
  }

  interface IShareTrack extends ITrackTop {
    isPlaying: boolean;
  }

  export interface IUserRef {
    _id: string;
    email: string;
    name: string;
    avatar: string;
  }

  export interface IComment {
    _id: string;
    postId: string;
    userId: string;
    parentId?: string | null; // có thể null hoặc không có
    content: string;
    likesCount: number;
    repliesCount: number;
    createdBy: IUserRef;
    updatedBy: IUserRef;
    user: {
      avatar: string;
      name: string;
    };
    // CHÚ Ý: children có thể có hoặc không!
    children?: IComment[]; // mảng IComment lồng nhau
  }

  export interface IPostDetail {
    _id: string;
    namePost: string;
    content: string;
    images: string[];
    videos: string[];
    userId: string | IUserRef; // có thể populate hoặc chỉ là ID
    createdBy: IUserRef;
    isDeleted: boolean;
    createdAt: string; // ISO Date string
    updatedAt: string | null;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean; // dựa vào user hiện tại
    comments: IComment[]; // danh sách comment cấp 1
    author: {
      _id: string;
      avatar: string;
      name: string;
    };
  }
  interface ITrackLike {
    _id: string;
    title: string;
    description: string;
    category: string;
    imgUrl: string;
    trackUrl: string;
    countLike: number;
    countPlay: number;
    createdAt: string;
    updatedAt: string;
  }

  interface IFile {
    images: string[];
    videos: string[];
  }

  interface IFriend {
    _id: string;
    name: string;
    avatar: string;
  }

  interface IGroups {
    _id: string;
    name: string;
    description: string;
    members: IUserRef[];
    admins: IUserRef[];
    membersCount: number;
    postsCount: number;
    avatar: string;
    coverPhoto: string;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    posts: IPost[];
    isJoined: boolean;
  }
  interface IStory {
    _id: string;
    userId: string;
    image: string;
    createdAt: string;
    avatar?: string; // sẽ lấy từ API user
    userName?: string; // sẽ lấy từ API user
  }
}
