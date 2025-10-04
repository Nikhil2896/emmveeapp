import { PermissionsAndroid } from 'react-native';

export const requestLocationPermission = async (): Promise<
  'granted' | 'denied' | 'never ask again' | 'disallow' | Error
> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
      return 'denied';
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'never ask again';
    } else {
      return 'disallow';
    }
  } catch (err: any) {
    return err;
  }
};
