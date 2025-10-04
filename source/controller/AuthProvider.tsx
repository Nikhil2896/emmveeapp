import React, { createContext, useState, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
  login: (email: string, password: string) => Promise<void | Error>;
  register: (
    email: string,
    password: string,
    name: string,
    mobile?: string,
  ) => Promise<void | Error>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

type UserData = {
  user: {
    uid: string;
    email: string | null;
  };
};

const addUser = (data: UserData, name: string, mobile?: string) => {
  const profileData = {
    name: name.trim(),
    image: '',
    updatedAt: new Date().toISOString(),
    mobile: mobile ?? '',
    email: data.user.email ?? '',
  };
  firebase
    .database()
    .ref('users/' + data.user.uid)
    .set(profileData)
    .then(() => {
      console.log('SUCCESSFULLY SIGNED');
    })
    .catch((error: any) => {
      console.log('Error in Sharing Doc', error);
    });
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const login = async (
    email: string,
    password: string,
  ): Promise<void | Error> => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      console.log('Login Error:', e);
      return e;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    mobile?: string,
  ): Promise<void | Error> => {
    try {
      const res = await auth().createUserWithEmailAndPassword(email, password);
      if (res.user) {
        await res.user.updateProfile({
          displayName: name,
        });
        addUser(res, name, mobile);
      }
    } catch (e: any) {
      console.log('Register Error:', e);
      return e;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await auth().signOut();
    } catch (e: any) {
      console.log('Logout Error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
