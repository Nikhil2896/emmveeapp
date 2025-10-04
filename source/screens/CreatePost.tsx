import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Theme from '../constants/Theme';
import ModelLoading from '../shared/ModalLoading';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import { RouteProp, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AuthContext } from '../controller/AuthProvider';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { requestLocationPermission } from '../controller/Permissions';

interface CreatePostProps {
  route: RouteProp<
    {
      params: {
        create: boolean;
        editable: boolean;
        data?: any;
        onRefresh?: () => void;
      };
    },
    'params'
  >;
}

interface SubmitButtonProps {
  submitText: string;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
}

interface PostData {
  title: string;
  description: string;
  userEmail: any;
  userId: any;
  eventTimeStamp?: number | string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  lactitude: number;
  longitude: number;
}

interface CoordinateEvent {
  nativeEvent: {
    coordinate: {
      latitude: number;
      longitude: number;
    };
  };
}

const CreatePost: React.FC<CreatePostProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const map = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<boolean>(true);
  const [dateOfEvent, setDateOfEvent] = useState<string>();
  const [timeOfEvent, setTimeOfEvent] = useState<string>();
  const [eventTimeStamp, setEventTimeStamp] = useState<number | string>('');
  const [lact, setLact] = useState(17.385);
  const [longit, setLongit] = useState(78.4867);
  const [region, setRegion] = useState({
    latitude: 17.385,
    longitude: 78.4867,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const { user } = useContext(AuthContext);

  let currentDate = new Date();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await requestLocationPermission();
        if (result === 'granted') {
          setLocationStatus(true);
        } else {
          setLocationStatus(false);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        setLocationStatus(false);
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    const routeData = route.params;
    if (!routeData.create && routeData.editable && routeData.data) {
      const timestamp = new Date(parseInt(routeData.data.eventTimeStamp, 10));
      setDescription(routeData.data.description);
      setEventName(routeData.data.title);
      setLact(routeData.data.lactitude);
      setLongit(routeData.data.longitude);
      onChange(undefined, timestamp);
    } else if (routeData.create && !routeData.editable) {
    }
  }, [refresh]);

  useEffect(() => {
    if (dateOfEvent && timeOfEvent && eventName && description) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [dateOfEvent, timeOfEvent, eventName, description]);

  const buttonName = () => {
    if (!route.params.create && route.params.editable) {
      return 'Update Event';
    } else if (route.params.create && !route.params.editable) {
      return 'Post Event';
    } else {
      return '';
    }
  };

  const convertToDateMs = (dateTime: string | Date) => {
    const date = new Date(dateTime);
    return date.getTime();
  };

  const onChange = (_event?: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate instanceof Date) {
      setShow(false);
      setDate(selectedDate);
      setDateOfEvent(selectedDate.toLocaleDateString());
      setTimeOfEvent(
        selectedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      );
      setEventTimeStamp(convertToDateMs(selectedDate));
    } else {
      console.error('Invalid date format:', selectedDate);
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setShow(true);
    setMode(currentMode);
  };

  const createPost = async () => {
    try {
      setLoading(true);
      setErrorText('');
      const postData: PostData = {
        title: eventName,
        description: description,
        userEmail: user?.email,
        userId: user?.uid,
        lactitude: lact,
        longitude: longit,
        eventTimeStamp: eventTimeStamp,
        createdAt: new Date().toString(),
        updatedAt: new Date().toString(),
        isDeleted: false,
      };
      await firestore().collection('posts').add(postData);
      setLoading(false);
      navigation.goBack();
    } catch (error: any) {
      console.log('Create Post Error:', error);
      setErrorText('Failed to create post');
      setLoading(false);
    }
  };

  const updatePost = async (updateData: Partial<PostData>) => {
    try {
      setLoading(true);
      setErrorText('');
      await firestore()
        .collection('posts')
        .doc(route.params.data.key)
        .update(updateData);
      setLoading(false);
      route.params.onRefresh?.();
      navigation.goBack();
    } catch (error: any) {
      console.log('Update Post Error:', error);
      setErrorText('Failed to update post');
      setLoading(false);
    }
  };

  const onSubmit = () => {
    if (!route.params.create && route.params.editable) {
      const updateData = {
        title: eventName,
        description,
        eventTimeStamp,
        updatedAt: new Date().toString(),
      };
      updatePost(updateData);
    } else if (route.params.create && !route.params.editable) {
      createPost();
    } else {
      console.log('Button Pressed');
    }
  };

  const getLocation = (data: CoordinateEvent) => {
    setLact(data.nativeEvent.coordinate.latitude);
    setLongit(data.nativeEvent.coordinate.longitude);
  };

  const SubmitButton: React.FC<SubmitButtonProps> = ({
    submitText,
    onPress,
    disabled = false,
    error = '',
  }) => {
    return (
      <>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.submitView}>
          <TouchableOpacity
            style={[
              styles.submitButtonView,
              {
                backgroundColor: disabled
                  ? Theme.colors.placeHolder
                  : Theme.colors.primaryColor,
              },
            ]}
            onPress={onPress}
            disabled={disabled}
          >
            <Text style={styles.postText}>{submitText}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <>
      {locationStatus ? (
        <ScrollView style={styles.scrollContainer}>
          <ModelLoading visible={loading} />
          <View style={styles.headerView}>
            <Icon
              name="arrow-left"
              size={30}
              color={Theme.colors.primaryDark}
              onPress={() => navigation.goBack()}
            />
            {!route.params.create && route.params.editable && (
              <Icon
                name="trash-can"
                size={30}
                color={Theme.colors.error}
                onPress={() =>
                  updatePost({
                    isDeleted: true,
                    updatedAt: new Date().toString(),
                  })
                }
              />
            )}
          </View>

          <View style={styles.container}>
            <View style={{ width: '100%', marginTop: 30 }}>
              <TextInput
                style={styles.textInput}
                onChangeText={setEventName}
                value={eventName}
                placeholder="Event Name*"
                placeholderTextColor={Theme.colors.placeHolder}
                maxLength={50}
                selectionColor={Theme.colors.primaryColor}
                underlineColorAndroid={Theme.colors.primaryColor}
              />
              <TextInput
                style={[styles.textInput, styles.textTop]}
                onChangeText={setDescription}
                value={description}
                placeholder="Event Description...*"
                placeholderTextColor={Theme.colors.placeHolder}
                numberOfLines={5}
                maxLength={250}
                multiline
                selectionColor={Theme.colors.primaryColor}
                underlineColorAndroid={Theme.colors.primaryColor}
              />
              <View style={styles.pickerView}>
                <TouchableOpacity
                  onPress={() => showMode('date')}
                  style={[styles.dateView, { width: '50%' }]}
                >
                  <Text style={styles.dateText}>
                    {dateOfEvent || 'Select Date'}
                  </Text>
                  <Icon name="chevron-down" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => showMode('time')}
                  style={[styles.dateView, { width: '45%' }]}
                >
                  <Text style={styles.dateText}>
                    {timeOfEvent || 'Select Time'}
                  </Text>
                  <Icon name="chevron-down" size={20} />
                </TouchableOpacity>
              </View>
              <View style={{ height: 300, marginTop: 20 }}>
                <MapView
                  ref={map}
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={region}
                  onPress={getLocation}
                  showsUserLocation={true}
                >
                  <Marker
                    coordinate={{
                      latitude: lact,
                      longitude: longit,
                    }}
                  />
                </MapView>
              </View>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={mode}
                  onChange={onChange}
                  minimumDate={new Date()}
                  maximumDate={
                    new Date(
                      currentDate.setFullYear(currentDate.getFullYear() + 1),
                    )
                  }
                />
              )}

              <SubmitButton
                disabled={disabled}
                submitText={buttonName()}
                onPress={onSubmit}
                error={errorText}
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.locationOff}>
          <Icon
            name="map-marker-off"
            size={200}
            color={Theme.colors.primaryColor}
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.noLocationText}>Location not available</Text>
          <Text onPress={() => setRefresh(!refresh)} style={styles.refresh}>
            Refresh
          </Text>
        </View>
      )}
    </>
  );
};

export default CreatePost;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Theme.colors.primaryLight,
  },
  container: {
    backgroundColor: Theme.colors.white,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    elevation: 4,
    alignItems: 'center',
    borderRadius: 4,
  },
  textInput: {
    color: Theme.colors.primaryDark,
    fontSize: Theme.fontSize.regular,
  },
  textTop: {
    textAlignVertical: 'top',
  },
  pickerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  dateView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 5,
    borderColor: Theme.colors.primaryColor,
    padding: 10,
  },
  dateText: {
    fontSize: Theme.fontSize.medium,
    color: Theme.colors.primaryDark,
  },
  locationOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primaryLight,
  },
  noLocationText: {
    color: Theme.colors.primaryColor,
    fontSize: Theme.fontSize.regular,
    marginBottom: 10,
    marginTop: 30,
  },
  refresh: {
    color: Theme.colors.primaryColor,
    textDecorationLine: 'underline',
    fontSize: Theme.fontSize.regular,
  },
  popStyle: {
    padding: 20,
    width: 300,
    borderRadius: 5,
  },
  headerView: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 15,
  },
  submitView: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  submitButtonView: {
    borderRadius: 5,
    elevation: 2,
  },
  postText: {
    color: Theme.colors.primaryLight,
    fontSize: Theme.fontSize.regular,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontFamily: Theme.fonts.medium,
  },
  errorText: {
    color: Theme.colors.primaryColor,
    paddingHorizontal: 10,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSize.small,
    textAlign: 'center',
    marginTop: 20,
  },
  map: {
    height: '100%',
    width: '100%',
  },
});
