import { initializeApp } from 'firebase-admin/app';
import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const app = initializeApp();
const messaging = getMessaging(app);

async function sendNotification(token, title, body, postID) {
  if (!token) {
    console.log('No FCM token provided. Skipping notification.');
    return;
  }
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      postID: postID || '',
    },
    token: token,
    android: {
      priority: 'high',
    },
  };

  try {
    const response = await messaging.send(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.log('Notification sent failed:', error);
  }
}

// export const sendPushNotification = onDocumentCreated(
//   'invites/{inviteId}',
//   async event => {
//     const messageData = event.data?.data();

//     await sendNotification(
//       messageData.invitedFcm,
//       'New Invitation!!!',
//       messageData.postedUserName + ' invited you to an event',
//       messageData.postID,
//     );
//   },
// );

export const sendPushNotificationOnUpdate = onDocumentUpdated(
  'invites/{inviteId}',
  async event => {
    const previousData = event.data.before.data();
    const updatedData = event.data.after.data();

    if (
      !previousData ||
      !updatedData ||
      updatedData.status === previousData.status
    ) {
      console.log(
        'No-op update or status did not change. Skipping notification.',
      );
      return;
    }

    if (
      !updatedData.postedFcm ||
      !updatedData.invitedName ||
      !updatedData.status
    ) {
      console.log(
        'Required fields for update notification are missing. Aborting.',
      );
      return;
    }

    await sendNotification(
      updatedData.postedFcm,
      'Invitation Update',
      `${updatedData.invitedName} ${updatedData.status} your invite`,
      updatedData.postID,
    );
  },
);
