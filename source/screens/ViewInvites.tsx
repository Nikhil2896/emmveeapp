import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const ViewInvites: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>ViewPost Screen</Text>
    </View>
  );
};

export default ViewInvites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
