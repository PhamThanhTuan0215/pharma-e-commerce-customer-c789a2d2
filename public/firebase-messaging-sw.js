importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyA94mh0YoGoSZXxJw8IxCwNz6PVB3Gs5Oo",
    authDomain: "thesis-notification-5a8e8.firebaseapp.com",
    projectId: "thesis-notification-5a8e8",
    storageBucket: "thesis-notification-5a8e8.firebasestorage.app",
    messagingSenderId: "158412355374",
    appId: "1:158412355374:web:97a720c6363031e6b1acbf",
    measurementId: "G-LP90YXL8WS"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Message received in the background:', payload);
});