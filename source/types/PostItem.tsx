export interface PostItem {
  id?: string;
  title: string;
  description: string;
  userEmail: string;
  userId: string;
  eventTimeStamp: number;
  createdAt: string | number;
  updatedAt: string | number;
  isDeleted?: boolean;
  latitude: number;
  longitude: number;
  postID: string;
}
