importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

// Initialize Firebase with configuration from the main window
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        firebase.initializeApp(event.data.config);
        const messaging = firebase.messaging();

        // Handle background messages
        messaging.onBackgroundMessage((payload) => {
            console.log('Received background message:', payload);

            // Customize notification based on payload
            const notificationTitle = payload.notification?.title || 'New Message';
            const notificationOptions = {
                body: payload.notification?.body || 'New message received',
                icon: payload.notification?.icon || '/firebase-logo.png',
                badge: payload.notification?.badge || '/badge.png',
                data: payload.data,
                tag: 'fcm-notification',
                renotify: true,
                requireInteraction: true
            };

            // Show notification
            return self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Handle the click action
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
}); 