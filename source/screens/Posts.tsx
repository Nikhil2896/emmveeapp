import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Posts = () => {
  return (
    <View style={styles.container}>
      <Text>Posts Screen</Text>
    </View>
  );
};

export default Posts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
