import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import Theme from '../constants/Theme';
import ModelLoading from '../shared/ModalLoading';
import { Routes } from '../constants/AppConstants';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../controller/AuthProvider';
import { Invite } from '../types/Invite';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate, formatTime } from '../controller/Datefunctions';

interface PostsProps {
  navigation: NativeStackNavigationProp<any>;
}

const Invitations: React.FC<PostsProps> = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [postsData, setPostsData] = useState<Invite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');

  useEffect(() => {
    getInvites();
    setLoading(true);
  }, [refresh]);

  const convertDate = (dateString: string): number => {
    const timestamp = new Date(dateString).getTime();
    return timestamp;
  };

  const getInvites = async () => {
    try {
      const dataList: Invite[] = [];
      setErrorText('');

      let query: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
        firestore()
          .collection('invites')
          .where('invitedUser', '==', user?.email)
          .orderBy('eventTimeStamp', 'asc');

      const fbQuery = query;
      const snapshot = await fbQuery.get();

      snapshot.forEach(doc => {
        const data = doc.data();
        dataList.push({
          inviteId: doc.id,
          postedUserId: data.postedUserId,
          postedUserEmail: data.postedUserEmail,
          postedFcm: data.postedFcm,
          eventTimeStamp: data.eventTimeStamp,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          title: data.title,
          invitedUser: data.invitedUser,
          invitedFcm: data.invitedFcm,
          postID: data.postID,
          status: data.status,
          postedUserName: data.postedUserName,
        });
      });
      setPostsData(dataList);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      if (error.code === 'failed-precondition') {
        setErrorText(
          'Firestore index missing. Please create the index in Firebase Console.',
        );
      } else {
        setErrorText('Failed to get posts');
      }
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setPostsData([]);
    setRefresh(!refresh);
  };

  const onPostClicked = (data: Invite) => {
    navigation.navigate(Routes.AdditionalStack, {
      screen: Routes.CreatePost,
      params: {
        from: Routes.MyPosts,
        editable: true,
        data: data,
        create: false,
        onRefresh: onRefresh,
      },
    });
  };

  const emptyComponent = () => (
    <View style={styles.emptyView}>
      <Icon
        name="email"
        size={200}
        color={Theme.colors.primaryColor}
        style={{ opacity: 0.5 }}
      />
      <Text style={styles.emptyText}>No Invites to display</Text>
    </View>
  );

  const renderItem: ListRenderItem<Invite> = ({ item }) => {
    const expired = item.eventTimeStamp <= Date.now();
    return (
      <TouchableOpacity
        disabled={expired}
        style={styles.flatListCardView}
        onPress={() => onPostClicked(item)}
      >
        {expired && (
          <View style={styles.expiredView}>
            <Text style={styles.expiredText}>Event expired</Text>
          </View>
        )}
        <View style={styles.cardDetailsView}>
          <Text style={styles.cardTitleText}>Event Name: {item.title}</Text>
          <View style={styles.cardSubView}>
            <View style={styles.iconedTimeView}>
              <Icon
                name="calendar-month"
                size={20}
                color={Theme.colors.primaryColor}
              />
              <Text numberOfLines={1} style={styles.iconedDetailsText}>
                {formatDate(item.eventTimeStamp)}
              </Text>
            </View>
            <View style={styles.iconedTimeView}>
              <Icon
                name="clock-outline"
                size={20}
                color={Theme.colors.primaryColor}
              />
              <Text numberOfLines={1} style={styles.iconedDetailsText}>
                {formatTime(item.eventTimeStamp)}
              </Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.postedText}>
            Invited By: {item.postedUserName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ModelLoading visible={loading} />
      {postsData && (
        <FlatList
          data={postsData}
          renderItem={renderItem}
          ListEmptyComponent={emptyComponent}
          contentContainerStyle={styles.flatlistStyle}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 1,
                backgroundColor: Theme.colors.placeHolder,
                marginHorizontal: 20,
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[Theme.colors.primaryColor]}
              progressBackgroundColor={Theme.colors.primaryLight}
            />
          }
        />
      )}
    </View>
  );
};

export default Invitations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primaryLight,
  },
  emptyView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: Theme.colors.primaryColor,
    fontSize: Theme.fontSize.regular,
    fontFamily: Theme.fonts.regular,
    marginBottom: 10,
  },
  flatlistStyle: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  flatListCardView: {
    borderRadius: 5,
    backgroundColor: Theme.colors.white,
  },
  expiredView: {
    backgroundColor: Theme.colors.primaryLight,
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    opacity: 0.7,
  },
  expiredText: {
    textAlign: 'center',
    padding: 10,
    color: Theme.colors.primaryDark,
    fontSize: Theme.fontSize.medium,
    fontFamily: Theme.fonts.semiBold,
  },
  cardDetailsView: {
    padding: 20,
  },
  cardTitleText: {
    fontFamily: Theme.fonts.medium,
    fontSize: Theme.fontSize.regular,
    color: Theme.colors.primaryDark,
    lineHeight: 20,
  },
  locationIconedView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
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
  postedText: {
    fontFamily: Theme.fonts.light,
    fontSize: Theme.fontSize.small,
    color: Theme.colors.primaryDark,
    textAlign: 'right',
    marginTop: 15,
  },
});
