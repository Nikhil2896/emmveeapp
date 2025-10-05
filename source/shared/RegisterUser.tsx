import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Routes } from '../constants/AppConstants';
import Theme from '../constants/Theme';
import { AuthContext } from '../controller/AuthProvider';
import ModalLoading from './ModalLoading';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';

type RegisterUserProps = {
  from: typeof Routes.Login | typeof Routes.Profile;
  number?: string;
  city?: string;
  success: () => void;
  setReload?: (reload: boolean) => void;
};

const RegisterUser: React.FC<RegisterUserProps> = props => {
  const { register, user } = useContext(AuthContext);

  const [name, setName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (props.from === Routes.Login) {
      setDisabled(!(email && name && password));
    } else {
      setDisabled(!(email && name));
    }
  }, [email, name, password, props.from]);

  useEffect(() => {
    if (props.from === Routes.Profile) {
      auth().currentUser?.providerData.forEach(userInfo => {
        setName(userInfo.displayName || '');
        setEmail(userInfo.email || '');
      });
      setModalLoading(true);
      if (props.number) {
        setMobile(props.number);
        setModalLoading(false);
      } else if (user) {
        setEmail(user.email || '');
        firebase
          .database()
          .ref('users/' + user.uid)
          .once('value')
          .then(response => {
            const val = response.val();
            if (val) {
              setMobile(val.mobile || '');
            }
            setModalLoading(false);
          });
      }
    }
  }, [user, props]);

  const userRegister = () => {
    setModalLoading(true);
    setDisabled(true);
    setErrorMessage(null);
    register(email.toLowerCase(), password, name, mobile).then(
      (response: any) => {
        if (response) {
          const errorCode = response.code;
          switch (errorCode) {
            case 'auth/weak-password':
              setErrorMessage(
                'Password too weak. Please choose a strong password',
              );
              break;
            case 'auth/email-already-in-use':
              setErrorMessage('Entered email already in use');
              break;
            case 'auth/invalid-email':
              setErrorMessage('Invalid Email ID');
              break;
            default:
              setErrorMessage('Unexpected error! Please try again later');
          }
          setDisabled(false);
          setModalLoading(false);
        } else {
          props.success();
          setErrorMessage(null);
          setDisabled(false);
          setModalLoading(false);
          if (!props.city && props.setReload) {
            props.setReload(true);
          }
        }
      },
    );
  };

  const updateFirebase = async () => {
    const update = {
      displayName: name.trim(),
    };
    await auth().currentUser?.updateProfile(update);
    setDisabled(false);
    setModalLoading(false);
    props.success();
  };

  const updateUser = async () => {
    setDisabled(true);
    setModalLoading(true);
    setErrorMessage(null);
    try {
      let token = await messaging().getToken();
      const profileData = {
        name: name.trim(),
        mobile: mobile || '',
        updatedAt: new Date().toString(),
        email: email,
        fcm: token,
      };
      firebase
        .database()
        .ref('users/' + user?.uid)
        .set(profileData)
        .then(() => {
          console.log('FIREBASE UPDATED');
          updateFirebase();
        });
    } catch (e) {
      setDisabled(false);
      setModalLoading(false);
      setErrorMessage('Failed to update details. Please try again later');
      console.log('eeeeeeeeee', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ModalLoading visible={modalLoading} />
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Name :</Text>
          <TextInput
            placeholder="Enter your name..."
            maxLength={30}
            value={name}
            onChangeText={setName}
            multiline={false}
            selectionColor={Theme.colors.primaryColor}
            underlineColorAndroid={Theme.colors.primaryColor}
            style={styles.textInput}
            placeholderTextColor={Theme.colors.placeHolder}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Mobile number :</Text>
          <TextInput
            keyboardType="phone-pad"
            placeholder="Enter your mobile number..."
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
            multiline={false}
            selectionColor={Theme.colors.primaryColor}
            underlineColorAndroid={Theme.colors.primaryColor}
            style={styles.textInput}
            placeholderTextColor={Theme.colors.placeHolder}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.title}>Email :</Text>
          <TextInput
            editable={props.from !== Routes.Profile}
            keyboardType="email-address"
            placeholder="Enter your email..."
            maxLength={50}
            value={email}
            onChangeText={setEmail}
            multiline={false}
            selectionColor={Theme.colors.primaryColor}
            underlineColorAndroid={Theme.colors.primaryColor}
            style={styles.textInput}
            placeholderTextColor={Theme.colors.placeHolder}
          />
        </View>

        {props.from === Routes.Login && (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>Password :</Text>
            <TextInput
              placeholder="Enter your password..."
              maxLength={30}
              value={password}
              onChangeText={setPassword}
              multiline={false}
              selectionColor={Theme.colors.primaryColor}
              underlineColorAndroid={Theme.colors.primaryColor}
              style={styles.textInput}
              placeholderTextColor={Theme.colors.placeHolder}
              secureTextEntry
            />
          </View>
        )}

        {errorMessage && <Text style={styles.errorMsg}>{errorMessage}</Text>}

        <TouchableOpacity
          disabled={disabled}
          style={[
            styles.submitButton,
            { backgroundColor: disabled ? 'gray' : Theme.colors.primaryColor },
          ]}
          onPress={props.from === Routes.Login ? userRegister : updateUser}
        >
          <Text
            style={{
              color: Theme.colors.white,
              textAlign: 'center',
              padding: 10,
            }}
          >
            {props.from === Routes.Login ? 'Register' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterUser;

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
  errorMsg: {
    marginTop: 20,
    textAlign: 'center',
    color: Theme.colors.error,
    fontSize: Theme.fontSize.small,
  },
  avatarView: {
    alignSelf: 'center',
    height: 150,
    width: 150,
    marginVertical: 30,
    backgroundColor: Theme.colors.white,
    padding: 3,
  },
  fullWidth: {
    height: '100%',
    width: '100%',
    backgroundColor: Theme.colors.white,
  },
});
