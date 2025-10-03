import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const CreatePost: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>CreatePost Screen</Text>
    </View>
  );
};

export default CreatePost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
