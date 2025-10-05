import { initializeApp } from 'firebase-admin/app';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const app = initializeApp();

export const sendPushNotification = onDocumentCreated(
  'invites/{inviteId}',
  async snap => {
    const message = snap.data?.data();
    if (!message) return null;
    const payload = {
      notification: {
        title: 'New Invitation!!!',
        body: message.postedUserName + ' invited you to an event',
      },
      data: {
        postID: message.postID,
      },
      token: message.invitedFcm,
      android: {
        priority: 'high',
      },
    };

    await getMessaging(app)
      .send(payload)
      .then(function (response) {
        console.log('Notification sent successfully:', response);
      })
      .catch(function (error) {
        console.log('Notification sent failed:', error);
      });
  },
);
