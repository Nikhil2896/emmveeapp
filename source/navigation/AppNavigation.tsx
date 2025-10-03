import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Routes } from '../constants/AppConstants';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Theme from '../constants/Theme';
import CreatePost from '../screens/CreatePost';
import Profile from '../screens/Profile';
import Posts from '../screens/Posts';
import ViewPost from '../screens/ViewPost';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AppNavigation = () => {
  const MainStack = () => {
    return (
      <View style={styles.tabBarView}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarShowLabel: false,
            tabBarActiveTintColor: Theme.colors.primaryColor,
            tabBarInactiveTintColor: Theme.colors.primaryLight,
            tabBarStyle: styles.tabBarStyles,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string = 'help-circle';
              switch (route.name) {
                case Routes.Home:
                  iconName = 'home';
                  break;
                case Routes.MyPosts:
                  iconName = 'post';
                  break;
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name={Routes.Home}
            component={Home}
            options={{
              headerShown: false,
            }}
          />
          <Tab.Screen
            name={Routes.MyPosts}
            component={Posts}
            options={{
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </View>
    );
  };

  const AdditionalStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name={Routes.CreatePost}
          component={CreatePost}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={Routes.Profile}
          component={Profile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={Routes.ViewPost}
          component={ViewPost}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={true ? Routes.Login : Routes.Home}>
        <Stack.Screen
          name={Routes.Login}
          component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={Routes.MainStack}
          component={MainStack}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={Routes.AdditionalStack}
          component={AdditionalStack}
          options={{
            headerShown: false,
          }}
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
