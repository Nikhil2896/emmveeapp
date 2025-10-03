import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const ViewPost = () => {
  return (
    <View style={styles.container}>
      <Text>ViewPost Screen</Text>
    </View>
  );
};

export default ViewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
