import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TextInput, Keyboard } from 'react-native';
import Theme from '../constants/Theme';
import ModelLoading from '../shared/ModalLoading';
import PostsList from '../shared/PostsList';
import { Routes } from '../constants/AppConstants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { AuthContext } from '../controller/AuthProvider';
import { PostItem } from '../types/PostItem';

interface HomeProps {
  navigation: any;
}

const Home: React.FC<HomeProps> = props => {
  const { user } = useContext(AuthContext);
  const [postsData, setPostsData] = useState<PostItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searching, setSearching] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [refresh, setRefresh] = useState<boolean>(false);
  const [paginationState, setPaginationState] = useState<boolean>(true);
  const [lastVisible, setLastVisible] =
    useState<FirebaseFirestoreTypes.DocumentSnapshot | null>(null);

  useEffect(() => {
    const query: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
      firestore()
        .collection('posts')
        .where('isDeleted', '==', false)
        .orderBy('eventTimeStamp', 'asc');
    getPostsData(query, false);
  }, [refresh]);

  const regQuery = firestore()
    .collection('posts')
    .where('isDeleted', '==', false)
    .orderBy('eventTimeStamp', 'asc');

  const searchQuery = firestore()
    .collection('posts')
    .where('isDeleted', '==', false)
    .where('title', '>=', searchText)
    .where('title', '<=', searchText + '\uf8ff');

  const convertDate = (dateString: string): number => {
    const timestamp = new Date(dateString).getTime();
    return timestamp;
  };

  const getPostsData = async (
    fbQuery: FirebaseFirestoreTypes.Query,
    paginate: boolean,
  ) => {
    const dataList: PostItem[] = [];
    setErrorText('');
    try {
      const snapshot = await fbQuery.limit(10).get();
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      snapshot.forEach(doc => {
        const data = doc.data();
        dataList.push({
          title: data.title,
          description: data.description,
          userEmail: data.userEmail,
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          eventTimeStamp: data.eventTimeStamp,
          createdAt: convertDate(data.createdAt),
          updatedAt: data.updatedAt,
          postID: doc.id,
        });
      });
      if (paginate) {
        const merged = postsData.concat(dataList);
        setPostsData(merged);
        setPaginationState(snapshot.size > 0);
      } else {
        setPostsData(dataList);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error', error);
      setErrorText(error?.response?.data?.error || 'Failed to get posts');
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setPostsData([]);
    setLastVisible(null);
    setRefresh(!refresh);
    setPaginationState(true);
    setSearching(false);
    setSearchText('');
  };

  const onPostClicked = async (data: PostItem) => {
    props.navigation.navigate(Routes.AdditionalStack, {
      screen: Routes.CreatePost,
      params: {
        from: Routes.Home,
        editable: data.userId === user?.uid,
        data,
        create: false,
        onRefresh,
      },
    });
  };

  const paginateQuery = () => {
    if (lastVisible) {
      const query = searching
        ? searchQuery.startAfter(lastVisible)
        : regQuery.startAfter(lastVisible);
      getPostsData(query, true);
    }
  };

  const onSearch = () => {
    if (searchText) {
      setPostsData([]);
      setLastVisible(null);
      setPaginationState(true);
      setSearching(true);
      Keyboard.dismiss();
      setLoading(true);
      getPostsData(searchQuery, false);
    }
  };

  const searchView = () => (
    <View style={styles.searchView}>
      <TextInput
        style={styles.textInput}
        onChangeText={setSearchText}
        value={searchText}
        placeholder="Search event"
        placeholderTextColor={Theme.colors.placeHolder}
        maxLength={25}
        selectionColor={Theme.colors.primaryColor}
      />
      <Icon
        name="magnify"
        size={30}
        color={searchText ? Theme.colors.primaryDark : Theme.colors.placeHolder}
        style={styles.searchIcon}
        onPress={onSearch}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ModelLoading visible={loading} />
      {searchView()}
      {postsData && (
        <PostsList
          onRefresh={onRefresh}
          paginate={() => paginationState && paginateQuery()}
          data={postsData}
          loading={loading}
          stopPaginate={paginationState}
          onPostClicked={onPostClicked}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primaryLight,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 100,
    borderColor: Theme.colors.primaryColor,
    paddingHorizontal: 15,
    color: Theme.colors.primaryDark,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSize.medium,
  },
  searchIcon: {
    position: 'absolute',
    right: 15,
    top: 11,
  },
  searchView: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 100,
    elevation: 5,
    backgroundColor: Theme.colors.white,
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
    fontFamily: Theme.fonts.regular,
    marginBottom: 10,
    marginTop: 30,
  },
  refresh: {
    color: Theme.colors.primaryColor,
    textDecorationLine: 'underline',
    fontSize: Theme.fontSize.regular,
    fontFamily: Theme.fonts.medium,
  },
});
