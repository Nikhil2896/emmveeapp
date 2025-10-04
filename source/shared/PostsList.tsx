import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import Theme from '../constants/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate, formatTime } from '../controller/Datefunctions';
import { PostItem } from '../types/PostItem';

interface PostsListProps {
  data: PostItem[];
  loading: boolean;
  stopPaginate?: boolean;
  paginate?: () => void;
  onRefresh: () => void;
  onPostClicked: (item: PostItem) => void;
}

const PostsList: React.FC<PostsListProps> = ({
  data,
  loading,
  stopPaginate = false,
  paginate,
  onRefresh,
  onPostClicked,
}) => {
  const isEmpty = !data || data.length === 0;

  const renderItem: ListRenderItem<PostItem> = ({ item }) => {
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
          <Text style={styles.cardTitleText}>{item.title}</Text>
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
            Posted on: {formatDate(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const emptyComponent = () => (
    <View style={styles.emptyView}>
      <Icon
        name="message-image"
        size={200}
        color={Theme.colors.primaryColor}
        style={{ opacity: 0.5 }}
      />
      <Text style={styles.emptyText}>No posts to display</Text>
    </View>
  );

  const footerComponent = () => (
    <Text style={styles.footerText}>
      {stopPaginate ? 'Loading...' : 'End of the posts'}
    </Text>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      ListEmptyComponent={emptyComponent}
      contentContainerStyle={styles.flatlistStyle}
      onEndReached={paginate}
      ListFooterComponent={!isEmpty ? footerComponent : null}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={[Theme.colors.primaryColor]}
          progressBackgroundColor={Theme.colors.primaryLight}
        />
      }
    />
  );
};

export default PostsList;

const styles = StyleSheet.create({
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
    paddingTop: 10,
    paddingBottom: 100,
  },
  flatListCardView: {
    borderRadius: 5,
    backgroundColor: Theme.colors.white,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 20,
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
  postedText: {
    fontFamily: Theme.fonts.light,
    fontSize: Theme.fontSize.small,
    color: Theme.colors.primaryDark,
    textAlign: 'right',
    marginTop: 15,
  },
  iconedTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  footerText: {
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSize.small,
    color: Theme.colors.primaryColor,
    textAlign: 'center',
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
});
