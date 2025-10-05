export interface Invite {
  inviteId: string;
  postedUserId: string;
  postedUserEmail: string;
  postedUserName: string;
  postedFcm: string;
  eventTimeStamp: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  invitedUser: string;
  invitedFcm: string;
  postID: string;
  status: 'pending' | 'accepted' | 'rejected' | string;
}
