import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import Theme from '../constants/Theme';
import ModelLoading from '../shared/ModalLoading';
import PostsList from '../shared/PostsList';
import { Routes } from '../constants/AppConstants';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../controller/AuthProvider';
import { PostItem } from '../types/PostItem';

interface PostsProps {
  navigation: NativeStackNavigationProp<any>;
}

const Posts: React.FC<PostsProps> = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [postsData, setPostsData] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  const [lastVisible, setLastVisible] =
    useState<FirebaseFirestoreTypes.DocumentSnapshot | null>(null);
  const [paginationState, setPaginationState] = useState<boolean>(true);

  useEffect(() => {
    getPostsData(false);
    setLoading(true);
  }, [refresh]);

  const convertDate = (dateString: string): number => {
    const timestamp = new Date(dateString).getTime();
    return timestamp;
  };

  const getPostsData = async (paginate: boolean) => {
    try {
      const dataList: PostItem[] = [];
      setErrorText('');

      let query: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
        firestore()
          .collection('posts')
          .where('userId', '==', user?.uid)
          .where('isDeleted', '==', false)
          .orderBy('eventTimeStamp', 'desc');

      const fbQuery = lastVisible ? query.startAfter(lastVisible) : query;
      const snapshot = await fbQuery.limit(5).get();

      setLastVisible(snapshot.docs[snapshot.docs.length - 1] ?? null);

      snapshot.forEach(doc => {
        const data = doc.data();
        dataList.push({
          title: data.title,
          description: data.description,
          userEmail: data.userEmail,
          userId: data.userId,
          lactitude: data.lactitude,
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
        setPaginationState(snapshot.size !== 0);
      } else {
        setPostsData(dataList);
      }

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
    setLastVisible(null);
    setRefresh(!refresh);
    setPaginationState(true);
  };

  const onPostClicked = (data: PostItem) => {
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

  return (
    <View style={styles.container}>
      <ModelLoading visible={loading} />
      {postsData && (
        <PostsList
          onRefresh={onRefresh}
          paginate={() => paginationState && getPostsData(true)}
          data={postsData}
          loading={loading}
          stopPaginate={paginationState}
          onPostClicked={onPostClicked}
        />
      )}
    </View>
  );
};

export default Posts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primaryLight,
    paddingTop: 10,
  },
});
