import React from 'react';
import { Modal, StyleSheet, View, ActivityIndicator } from 'react-native';
import Theme from '../constants/Theme';

type ModalLoadingProps = {
  visible: boolean;
};

const ModalLoading: React.FC<ModalLoadingProps> = ({ visible }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
    >
      <View style={styles.modal}>
        <ActivityIndicator size="large" color={Theme.colors.primaryColor} />
      </View>
    </Modal>
  );
};

export default ModalLoading;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
