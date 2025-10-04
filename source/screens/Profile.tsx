import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Routes } from '../constants/AppConstants';
import RegisterUser from '../shared/RegisterUser';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  [Routes.Profile]: undefined;
};

type ProfileProps = NativeStackScreenProps<
  RootStackParamList,
  typeof Routes.Profile
>;

const Profile: React.FC<ProfileProps> = ({ navigation }) => {
  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <RegisterUser from={Routes.Profile} success={goBack} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
