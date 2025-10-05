import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Routes } from '../constants/AppConstants';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Theme from '../constants/Theme';
import CreatePost from '../screens/CreatePost';
import Profile from '../screens/Profile';
import Posts from '../screens/Posts';
import ViewInvites from '../screens/ViewInvites';
import Invitations from '../screens/Invitations.tsx';
import { AuthContext } from '../controller/AuthProvider';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type RootStackParamList = {
  [Routes.Login]: undefined;
  [Routes.MainStack]: undefined;
  [Routes.AdditionalStack]: undefined;
};

type MainTabParamList = {
  [Routes.Home]: undefined;
  [Routes.MyPosts]: undefined;
  [Routes.Invitations]: undefined;
};

type AdditionalStackParamList = {
  [Routes.CreatePost]: undefined;
  [Routes.Profile]: undefined;
  [Routes.ViewInvites]: undefined;
};

interface HeaderIconProps {
  navigation: StackNavigationProp<any>;
  to: string;
}

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const Additional = createStackNavigator<AdditionalStackParamList>();

const AppNavigation: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const [initializing, setInitializing] = useState<boolean>(true);

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  const HeaderIcon: React.FC<HeaderIconProps> = ({ navigation, to }) => {
    return (
      <TouchableOpacity
        style={{ marginHorizontal: 20 }}
        onPress={() =>
          navigation.navigate(Routes.AdditionalStack, {
            screen: to,
            params: {
              from: Routes.AppNavigation,
              editable: false,
              create: true,
            },
          })
        }
      >
        <Icon
          name={to === Routes.Profile ? 'account' : 'plus'}
          size={35}
          style={{ color: Theme.colors.primaryLight }}
        />
      </TouchableOpacity>
    );
  };

  const MainHeader = () => {
    return (
      <Text
        style={{
          textAlign: 'center',
          color: Theme.colors.primaryLight,
          fontSize: Theme.fontSize.large,
        }}
      >
        EMMVEEE
      </Text>
    );
  };

  const MainStack: React.FC = () => {
    return (
      <View style={styles.tabBarView}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarShowLabel: false,
            tabBarActiveTintColor: Theme.colors.primaryColor,
            tabBarInactiveTintColor: Theme.colors.primaryLight,
            tabBarStyle: styles.tabBarStyles,
            tabBarIcon: ({ color, size }) => {
              let iconName: string = 'help-circle';
              switch (route.name) {
                case Routes.Home:
                  iconName = 'home';
                  break;
                case Routes.MyPosts:
                  iconName = 'post';
                  break;
                case Routes.Invitations:
                  iconName = 'email';
                  break;
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name={Routes.Home}
            component={Home}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name={Routes.MyPosts}
            component={Posts}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name={Routes.Invitations}
            component={Invitations}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </View>
    );
  };

  const AdditionalStack: React.FC = () => {
    return (
      <Additional.Navigator>
        <Additional.Screen
          name={Routes.CreatePost}
          component={CreatePost}
          options={{ headerShown: false }}
        />
        <Additional.Screen
          name={Routes.Profile}
          component={Profile}
          options={{ headerShown: false }}
        />
        <Additional.Screen
          name={Routes.ViewInvites}
          component={ViewInvites}
          options={{ headerShown: false }}
        />
      </Additional.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? Routes.MainStack : Routes.Login}
      >
        <Stack.Screen
          name={Routes.Login}
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={Routes.MainStack}
          component={MainStack}
          options={({ navigation }) => ({
            headerTitle: () => <MainHeader />,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: Theme.colors.primaryDark,
            },
            headerLeft: () => (
              <HeaderIcon navigation={navigation} to={Routes.Profile} />
            ),
            headerRight: () => (
              <HeaderIcon navigation={navigation} to={Routes.CreatePost} />
            ),
          })}
        />
        <Stack.Screen
          name={Routes.AdditionalStack}
          component={AdditionalStack}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({
  tabBarStyles: {
    backgroundColor: Theme.colors.primaryDark,
  },
  tabBarView: {
    flex: 1,
  },
});
