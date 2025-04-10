// Firebase configuration
const defaultConfig = {
    apiKey: "AIzaSyAVSHsTGCavMC1e3lUTlj2IxjiS1eSWaTE",
    authDomain: "mypushads-7509e.firebaseapp.com",
    projectId: "mypushads-7509e",
    messagingSenderId: "522956243134",
    appId: "1:522956243134:web:5ad4b462e52fefceac5eef"
};

// State management
let currentConfig = { ...defaultConfig };
let messaging = null;

// DOM Elements
const outputContainer = document.getElementById('output');
const clearButton = document.getElementById('clear-button');
const connectButton = document.getElementById('connect-button');

// Logging System
const logTypes = {
    INFO: 'info',
    SUCCESS: 'success',
    ERROR: 'error'
};

function log(message, type = logTypes.INFO) {
    const timestamp = new Date().toISOString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    outputContainer.appendChild(logEntry);
    outputContainer.scrollTop = outputContainer.scrollHeight;
}

// Firebase Initialization
async function initializeFirebase(config) {
    try {
        if (firebase.apps.length) {
            await firebase.app().delete();
        }
        firebase.initializeApp(config);
        messaging = firebase.messaging();
        log('Firebase initialized successfully', logTypes.SUCCESS);
        return true;
    } catch (error) {
        log(`Firebase initialization error: ${error.message}`, logTypes.ERROR);
        return false;
    }
}

// Token Management
async function getToken() {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Notification permission denied');
        }

        const token = await messaging.getToken();
        log(`FCM Token obtained: ${token}`, logTypes.SUCCESS);
        return token;
    } catch (error) {
        log(`Error getting token: ${error.message}`, logTypes.ERROR);
        return null;
    }
}

// Message Handling
function setupMessageHandling() {
    messaging.onMessage((payload) => {
        log('New message received:', logTypes.INFO);
        log(JSON.stringify(payload, null, 2), logTypes.INFO);
    });

    messaging.onTokenRefresh(async () => {
        const token = await getToken();
        log(`Token refreshed: ${token}`, logTypes.INFO);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load default config
    document.getElementById('api-key').value = defaultConfig.apiKey;
    document.getElementById('project-id').value = defaultConfig.projectId;
    document.getElementById('messaging-sender-id').value = defaultConfig.messagingSenderId;
    document.getElementById('app-id').value = defaultConfig.appId;

    clearButton.addEventListener('click', () => {
        outputContainer.innerHTML = '';
        log('Output cleared', logTypes.INFO);
    });

    connectButton.addEventListener('click', async () => {
        // Get current configuration
        currentConfig = {
            apiKey: document.getElementById('api-key').value,
            authDomain: `${document.getElementById('project-id').value}.firebaseapp.com`,
            projectId: document.getElementById('project-id').value,
            messagingSenderId: document.getElementById('messaging-sender-id').value,
            appId: document.getElementById('app-id').value
        };

        // Initialize Firebase
        if (await initializeFirebase(currentConfig)) {
            const token = await getToken();
            if (token) {
                setupMessageHandling();
                log('Monitoring started - waiting for messages...', logTypes.SUCCESS);
            }
        }
    });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            log('Service Worker registered successfully', logTypes.SUCCESS);
        } catch (error) {
            log(`Service Worker registration failed: ${error.message}`, logTypes.ERROR);
        }
    });
} 