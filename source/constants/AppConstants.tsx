export const Routes = {
  Login: 'LOGIN',
  Home: 'HOME',
  MyPosts: 'MY_POSTS',
  CreatePost: 'CREATE_POST',
  Profile: 'PROFILE',
  AppNavigation: 'APP_NAVIGATION',
  ViewPost: 'VIEW_POST',
  MainStack: 'MAINSTACK',
  AdditionalStack: 'ADDITIONAL_STACK',
} as const;

export type RouteNames = (typeof Routes)[keyof typeof Routes];
