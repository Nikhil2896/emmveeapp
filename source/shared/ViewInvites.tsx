import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Theme from '../constants/Theme';
import ModelLoading from './ModalLoading';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import {
  RouteProp,
  useNavigation,
  useRoute,
  CompositeNavigationProp,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Invite } from '../types/Invite';

type ViewInvitesRouteParams = {
  create: boolean;
  editable: boolean;
  data?: {
    postID: string;
    inviteId: string;
    status?: string;
  };
  onRefresh?: () => void;
};

type ViewInvitesNavigationProp = StackNavigationProp<any>;

const ViewInvites: React.FC = () => {
  const navigation = useNavigation<ViewInvitesNavigationProp>();
  const route =
    useRoute<RouteProp<{ params: ViewInvitesRouteParams }, 'params'>>();
  const map = useRef<MapView | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string | boolean>(false);
  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [dateOfEvent, setDateOfEvent] = useState<string>();
  const [timeOfEvent, setTimeOfEvent] = useState<string>();
  const [lact, setLact] = useState<number>(17.385);
  const [longit, setLongit] = useState<number>(78.4867);
  const [region, setRegion] = useState<Region>({
    latitude: 17.385,
    longitude: 78.4867,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    getInvitation();
  }, []);

  const getInvitation = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .doc(route.params.data?.postID)
        .get();
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (!data) return;
        const timestamp = new Date(parseInt(data.eventTimeStamp, 10));
        setDescription(data.description);
        setEventName(data.title);
        setLact(data.latitude);
        setLongit(data.longitude);
        setStatus(route.params.data?.status || '');
        onChange(undefined, timestamp);
        setRegion({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        console.log('No invite found for this ID');
      }
    } catch (error) {
      console.log('Failed to get invites', error);
      setLoading(false);
    }
  };

  const onChange = (_event?: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate instanceof Date) {
      setDateOfEvent(selectedDate.toLocaleDateString());
      setTimeOfEvent(
        selectedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      );
    } else {
      console.error('Invalid date format:', selectedDate);
    }
  };

  const updateStatus = async (updateData: Partial<Invite>) => {
    try {
      setLoading(true);
      setErrorText('');
      await firestore()
        .collection('invites')
        .doc(route.params.data?.inviteId)
        .update(updateData);
      setLoading(false);
      route.params.onRefresh?.();
      navigation.goBack();
    } catch (error: any) {
      console.log('Update Invite Error:', error);
      setErrorText('Failed to take action');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <ModelLoading visible={loading} />
      <View style={styles.headerView}>
        <Icon
          name="arrow-left"
          size={30}
          color={Theme.colors.primaryDark}
          onPress={() => navigation.goBack()}
        />
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
            editable={false}
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
            editable={false}
          />

          <View style={styles.cardSubView}>
            <View style={styles.iconedTimeView}>
              <Icon
                name={'calendar-month'}
                size={20}
                color={Theme.colors.primaryColor}
              />
              <Text numberOfLines={1} style={styles.iconedDetailsText}>
                {dateOfEvent}
              </Text>
            </View>

            <View style={styles.iconedTimeView}>
              <Icon
                name={'clock-outline'}
                size={20}
                color={Theme.colors.primaryColor}
              />
              <Text numberOfLines={1} style={styles.iconedDetailsText}>
                {timeOfEvent}
              </Text>
            </View>
          </View>

          <View style={{ height: 300, marginTop: 20 }}>
            <MapView
              ref={map}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={region}
              showsUserLocation
            >
              <Marker coordinate={{ latitude: lact, longitude: longit }} />
            </MapView>
          </View>

          {status === 'Pending' ? (
            <View style={styles.buttonViews}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => updateStatus({ status: 'Accepted' })}
              >
                <Text style={styles.buttonsText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => updateStatus({ status: 'Rejected' })}
              >
                <Text style={styles.buttonsText}>Reject</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.statusText}>Invite {String(status)}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ViewInvites;

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
  cardSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginHorizontal: 20,
  },
  iconedDetailsText: {
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSize.small,
    color: Theme.colors.primaryDark,
    marginLeft: 7,
  },
  iconedTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  buttonViews: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 20,
    marginTop: 10,
  },
  buttonsText: {
    color: Theme.colors.primaryLight,
    fontSize: Theme.fontSize.medium,
  },
  acceptButton: {
    backgroundColor: Theme.colors.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: Theme.colors.error,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    elevation: 4,
  },
  statusText: {
    color: Theme.colors.primaryColor,
    fontSize: Theme.fontSize.large,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  headerView: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 15,
  },
  map: {
    height: '100%',
    width: '100%',
  },
});
