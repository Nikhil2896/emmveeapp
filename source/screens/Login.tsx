import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ScrollView,
  Modal,
  Linking,
  Button,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../controller/AuthProvider';
import { Routes } from '../constants/AppConstants';
import Theme from '../constants/Theme';
import RegisterUser from '../shared/RegisterUser';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  [Routes.Home]: { screen?: string };
  [Routes.Login]: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof Routes.Login
>;

interface LoginProps {
  navigation: LoginScreenNavigationProp;
}

interface FirebaseAuthError extends Error {
  code: string;
}

const Login: React.FC<LoginProps> = props => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openRegister, setOpenRegister] = useState<boolean>(false);

  const { login, passwordReset } = useContext(AuthContext);

  useEffect(() => {
    setDisabled(!(email && password));
  }, [email, password]);

  const userLogin = async () => {
    setLoading(true);
    setDisabled(true);
    setErrorMessage(null);
    const response = await login(email, password);
    if (response) {
      const error = response as FirebaseAuthError;
      switch (error.code) {
        case 'auth/user-not-found':
          setErrorMessage('Email ID not registered');
          break;
        case 'auth/wrong-password':
          setErrorMessage('Entered wrong password');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many attempts. Account Temporarily blocked');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Invalid Email ID');
          break;
        default:
          setErrorMessage('Unexpected error! Please try again later');
      }
      setLoading(false);
      setDisabled(false);
    } else {
      setErrorMessage(null);
      setLoading(false);
      setDisabled(false);
      // props.navigation.replace(Routes.Login, { screen: SEARCH });
    }
  };

  const resetPassword = async () => {
    setErrorMessage(null);
    if (!email) {
      setErrorMessage('Please enter your email address to reset your password');
      return;
    }

    const response = await passwordReset(email);
    if (response) {
      const error = response as FirebaseAuthError;
      switch (error.code) {
        case 'auth/user-not-found':
          setErrorMessage('Email ID not registered');
          break;
        case 'auth/too-many-requests':
          setErrorMessage(
            'Too many attempts. Account Temporarily blocked. Try resetting password',
          );
          break;
        case 'auth/invalid-email':
          setErrorMessage('Invalid Email ID');
          break;
        default:
          setErrorMessage('Unexpected error! Please try again later');
      }
    } else {
      setErrorMessage(
        'Password reset email sent to your registered email address',
      );
    }
  };

  const newUser = () => setOpenRegister(true);
  const closeRegister = () => setOpenRegister(false);
  const registered = () => {
    setOpenRegister(false);
    // props.navigation.replace(HOME, { screen: SEARCH });
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.form}>
          <Text style={{ textAlign: 'center', paddingBottom: 30 }}>LogIn</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.title}>Email :</Text>
            <TextInput
              keyboardType="email-address"
              placeholder="Enter your email..."
              maxLength={50}
              value={email}
              onChangeText={setEmail}
              multiline={false}
              selectionColor={Theme.colors.primaryColor}
              underlineColorAndroid={Theme.colors.primaryColor}
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.title}>Password :</Text>
            <TextInput
              secureTextEntry
              placeholder="Enter your password..."
              maxLength={30}
              value={password}
              onChangeText={setPassword}
              multiline={false}
              selectionColor={Theme.colors.primaryColor}
              underlineColorAndroid={Theme.colors.primaryColor}
              style={styles.textInput}
            />
          </View>

          {errorMessage && <Text style={styles.errorMsg}>{errorMessage}</Text>}

          <TouchableOpacity
            disabled={disabled}
            style={[
              styles.submitButton,
              {
                backgroundColor: disabled ? 'gray' : Theme.colors.primaryColor,
              },
            ]}
            onPress={userLogin}
          >
            <Text
              style={{
                color: Theme.colors.white,
                textAlign: 'center',
                padding: 10,
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
          <Text onPress={newUser} style={styles.links}>
            New user? Click here to register
          </Text>

          <Text onPress={resetPassword} style={styles.links}>
            Forgot password?
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={openRegister}
        animationType="slide"
        onRequestClose={closeRegister}
        transparent={true}
      >
        {/* <Header title="Register" close={closeRegister} /> */}
        <RegisterUser
          from={Routes.Login}
          success={registered}
          saveLogin={() => {}}
        />
      </Modal>
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: Theme.colors.white,
    paddingHorizontal: 15,
    paddingVertical: 30,
  },
  title: {
    fontSize: Theme.fontSize.medium,
  },
  textInput: {
    color: Theme.colors.primaryDark,
    fontSize: Theme.fontSize.regular,
  },
  inputContainer: {
    marginVertical: 5,
  },
  submitButton: {
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  links: {
    textAlign: 'center',
    color: Theme.colors.primaryColor,
    textDecorationLine: 'underline',
    fontSize: Theme.fontSize.small,
    marginTop: 20,
  },
  errorMsg: {
    marginTop: 20,
    textAlign: 'center',
    color: Theme.colors.error,
    fontSize: Theme.fontSize.small,
  },
});
