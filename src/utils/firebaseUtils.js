import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyA94mh0YoGoSZXxJw8IxCwNz6PVB3Gs5Oo",
    authDomain: "thesis-notification-5a8e8.firebaseapp.com",
    projectId: "thesis-notification-5a8e8",
    storageBucket: "thesis-notification-5a8e8.firebasestorage.app",
    messagingSenderId: "158412355374",
    appId: "1:158412355374:web:97a720c6363031e6b1acbf",
    measurementId: "G-LP90YXL8WS"
};

const vapidKey = "BOZCG0EjieBMSuFr7DSw86Z45-HxuIWjeol4O4Ing5jQpE2gIW9J3uld0T14Dax8X3YoOmSnha8_29SuU17HBR8";

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export const requestFCMToken = async () => {
    return Notification.requestPermission()
        .then((permission) => {
            if (permission === "granted") {
                return getToken(messaging, { vapidKey })
            }
            else {
                throw new Error("Notification not granted");
            }
        })
        .catch((err) => {
            console.error("Error requesting FCM token:", err);
            throw err;
        });
}

export const onMessageListener = (callback) => {
    onMessage(messaging, callback);
}