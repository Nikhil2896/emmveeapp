export const Routes = {
  Login: 'LOGIN',
  Home: 'HOME',
  MyPosts: 'MY_POSTS',
  CreatePost: 'CREATE_POST',
  Profile: 'PROFILE',
  AppNavigation: 'APP_NAVIGATION',
  Invitations: 'INVITATIONS',
  ViewInvites: 'VIEW_INVITES',
  MainStack: 'MAINSTACK',
  AdditionalStack: 'ADDITIONAL_STACK',
} as const;

export type RouteNames = (typeof Routes)[keyof typeof Routes];
