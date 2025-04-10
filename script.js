// Firebase configuration state
let firebaseConfig = {
    apiKey: '',
    projectId: '',
    messagingSenderId: '',
    appId: ''
};

// Server configuration state
let serverConfig = {
    url: '',
    redirectUrl: '',
    params: []
};

// DOM Elements
const connectButton = document.getElementById('connect-button');
const clearButton = document.getElementById('clear-button');
const outputDiv = document.getElementById('output');
const addParamButton = document.getElementById('add-param');
const paramsContainer = document.getElementById('params-container');

// Initialize Firebase inputs
document.getElementById('api-key').addEventListener('input', (e) => {
    firebaseConfig.apiKey = e.target.value;
});

document.getElementById('project-id').addEventListener('input', (e) => {
    firebaseConfig.projectId = e.target.value;
});

document.getElementById('messaging-sender-id').addEventListener('input', (e) => {
    firebaseConfig.messagingSenderId = e.target.value;
});

document.getElementById('app-id').addEventListener('input', (e) => {
    firebaseConfig.appId = e.target.value;
});

// Initialize server inputs
document.getElementById('server-url').addEventListener('input', (e) => {
    serverConfig.url = e.target.value;
});

document.getElementById('redirect-url').addEventListener('input', (e) => {
    serverConfig.redirectUrl = e.target.value;
});

// Add parameter row
addParamButton.addEventListener('click', () => {
    const paramRow = document.createElement('div');
    paramRow.className = 'param-row';
    
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Parameter Key';
    
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Parameter Value';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-param';
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => {
        paramRow.remove();
        updateServerParams();
    };
    
    paramRow.appendChild(keyInput);
    paramRow.appendChild(valueInput);
    paramRow.appendChild(removeButton);
    
    paramsContainer.appendChild(paramRow);
    
    // Add input listeners
    keyInput.addEventListener('input', updateServerParams);
    valueInput.addEventListener('input', updateServerParams);
});

// Update server parameters from UI
function updateServerParams() {
    const params = [];
    const paramRows = paramsContainer.querySelectorAll('.param-row');
    
    paramRows.forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value && valueInput.value) {
            params.push({
                key: keyInput.value,
                value: valueInput.value
            });
        }
    });
    
    serverConfig.params = params;
}

// Safe output logging
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const escapedMessage = String(message).replace(/[<>&"']/g, char => {
        const entities = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return entities[char];
    });
    
    const colorClass = type === 'error' ? 'color: #ff6b6b' : 
                      type === 'success' ? 'color: #51cf66' : 
                      'color: #e0e0e0';
    
    outputDiv.innerHTML += `<div style="${colorClass}">[${timestamp}] ${escapedMessage}</div>`;
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Send token to server
async function sendTokenToServer(token) {
    try {
        if (!serverConfig.url) {
            throw new Error('Server URL is required');
        }

        const payload = {
            token: token,
            ...Object.fromEntries(serverConfig.params.map(p => [p.key, p.value]))
        };

        log(`Sending token to server: ${serverConfig.url}`);
        
        const response = await fetch(serverConfig.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        log('Server response received', 'success');
        log(JSON.stringify(data, null, 2));

        // Store token in localStorage
        localStorage.setItem('sentMessagingToken', token);
        
        // Redirect if configured
        if (serverConfig.redirectUrl) {
            setTimeout(() => {
                window.location.href = serverConfig.redirectUrl;
            }, 100);
        }
    } catch (error) {
        log(`Server communication error: ${error.message}`, 'error');
        throw error;
    }
}

// Register service worker and send configuration
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        log('Service Worker registered successfully', 'success');

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;

        // Send Firebase configuration to the service worker
        registration.active.postMessage({
            type: 'FIREBASE_CONFIG',
            config: firebaseConfig
        });

        return registration;
    } catch (error) {
        log(`Service Worker registration failed: ${error.message}`, 'error');
        throw error;
    }
}

// Initialize Firebase and request notification permission
async function initializeFirebase() {
    try {
        // Validate Firebase config
        const requiredFields = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
        }

        // Register service worker and send configuration
        await registerServiceWorker();

        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        const messaging = firebase.messaging();
        
        // Request permission and get token
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Notification permission denied');
        }

        log('Notification permission granted', 'success');
        
        // Get FCM token
        const token = await messaging.getToken();
        log('FCM Token obtained', 'success');
        log(`Token: ${token}`, 'info');

        // Send token to server if configured
        if (serverConfig.url) {
            await sendTokenToServer(token);
        }

        // Set up message handling
        messaging.onMessage((payload) => {
            log('New message received:', 'info');
            log(JSON.stringify(payload, null, 2), 'info');
        });

        messaging.onTokenRefresh(async () => {
            const newToken = await messaging.getToken();
            log('Token refreshed:', 'info');
            log(`New token: ${newToken}`, 'info');
            
            // Send new token to server if configured
            if (serverConfig.url) {
                await sendTokenToServer(newToken);
            }
        });

        return token;
    } catch (error) {
        log(`Firebase initialization error: ${error.message}`, 'error');
        throw error;
    }
}

// Connect button handler
connectButton.addEventListener('click', async () => {
    try {
        connectButton.disabled = true;
        log('Starting FCM registration process...');
        
        await initializeFirebase();
        log('FCM registration process completed successfully', 'success');
    } catch (error) {
        log(`FCM registration failed: ${error.message}`, 'error');
    } finally {
        connectButton.disabled = false;
    }
});

// Clear output
clearButton.addEventListener('click', () => {
    outputDiv.innerHTML = '';
}); 