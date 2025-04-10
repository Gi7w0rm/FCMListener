// Firebase configuration state
let firebaseConfig = {
    apiKey: "AIzaSyAVSHsTGCavMC1e3lUTlj2IxjiS1eSWaTE",
    authDomain: "mypushads-7509e.firebaseapp.com",
    projectId: "mypushads-7509e",
    storageBucket: "mypushads-7509e.appspot.com",
    messagingSenderId: "522956243134",
    appId: "1:522956243134:web:5ad4b462e52fefceac5eef"
};

// Server configuration state
let serverConfig = {
    serverUrl: {
        url: "",
        params: {},
        headers: {},  // New headers object
        tokenParam: "t"
    },
    redirectUrl: {
        url: "",
        params: {}
    }
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
    serverConfig.serverUrl.url = e.target.value;
});

document.getElementById('token-param').addEventListener('input', (e) => {
    serverConfig.serverUrl.tokenParam = e.target.value || "t";  // Fallback to "t" if empty
});

document.getElementById('redirect-url').addEventListener('input', (e) => {
    serverConfig.redirectUrl.url = e.target.value;
});

// Add parameter row for server URL
document.getElementById('add-server-param').addEventListener('click', () => {
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
    
    document.getElementById('server-params-container').appendChild(paramRow);
    
    // Add input listeners
    keyInput.addEventListener('input', updateServerParams);
    valueInput.addEventListener('input', updateServerParams);
});

// Add parameter row for redirect URL
document.getElementById('add-redirect-param').addEventListener('click', () => {
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
        updateRedirectParams();
    };
    
    paramRow.appendChild(keyInput);
    paramRow.appendChild(valueInput);
    paramRow.appendChild(removeButton);
    
    document.getElementById('redirect-params-container').appendChild(paramRow);
    
    // Add input listeners
    keyInput.addEventListener('input', updateRedirectParams);
    valueInput.addEventListener('input', updateRedirectParams);
});

// Add header row for server
document.getElementById('add-server-header').addEventListener('click', () => {
    const headerRow = document.createElement('div');
    headerRow.className = 'param-row';
    
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'Header Name';
    
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Header Value';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-param';
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => {
        headerRow.remove();
        updateServerHeaders();
    };
    
    headerRow.appendChild(keyInput);
    headerRow.appendChild(valueInput);
    headerRow.appendChild(removeButton);
    
    document.getElementById('server-headers-container').appendChild(headerRow);
    
    // Add input listeners
    keyInput.addEventListener('input', updateServerHeaders);
    valueInput.addEventListener('input', updateServerHeaders);
});

// Update server parameters
function updateServerParams() {
    const params = {};
    const paramRows = document.getElementById('server-params-container').querySelectorAll('.param-row');
    
    paramRows.forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value && valueInput.value) {
            params[keyInput.value] = valueInput.value;
        }
    });
    
    serverConfig.serverUrl.params = params;
}

// Update redirect parameters
function updateRedirectParams() {
    const params = {};
    const paramRows = document.getElementById('redirect-params-container').querySelectorAll('.param-row');
    
    paramRows.forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value && valueInput.value) {
            params[keyInput.value] = valueInput.value;
        }
    });
    
    serverConfig.redirectUrl.params = params;
}

// Update server headers
function updateServerHeaders() {
    const headers = {};
    const headerRows = document.getElementById('server-headers-container').querySelectorAll('.param-row');
    
    headerRows.forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value && valueInput.value) {
            headers[keyInput.value] = valueInput.value;
        }
    });
    
    serverConfig.serverUrl.headers = headers;
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
        if (!serverConfig.serverUrl.url) {
            throw new Error('Server URL is required');
        }

        // Add token to server parameters
        const serverParams = new URLSearchParams({
            ...serverConfig.serverUrl.params,
            [serverConfig.serverUrl.tokenParam]: token
        });

        const serverUrl = `${serverConfig.serverUrl.url}?${serverParams.toString()}`;
        log(`Sending token to server: ${serverUrl}`);
        log(`Using parameter name '${serverConfig.serverUrl.tokenParam}' for FCM token`);
        
        // Log headers being sent
        if (Object.keys(serverConfig.serverUrl.headers).length > 0) {
            log('Sending with headers:', 'info');
            log(JSON.stringify(serverConfig.serverUrl.headers, null, 2));
        }

        const response = await fetch(serverUrl, {
            method: 'GET',
            headers: serverConfig.serverUrl.headers
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        // Try to parse as JSON, but don't fail if it's not JSON
        try {
            const data = await response.text();
            let jsonData;
            try {
                jsonData = JSON.parse(data);
                log('Server response received (JSON):', 'success');
                log(JSON.stringify(jsonData, null, 2));
            } catch {
                // If not JSON, log as text
                log('Server response received (Text):', 'success');
                log(data);
            }
        } catch (error) {
            log('Server response could not be read', 'error');
        }

        // Store token in localStorage
        localStorage.setItem('sentMessagingToken', token);
        
        // Handle redirect URL if configured
        if (serverConfig.redirectUrl.url) {
            const redirectParams = new URLSearchParams(serverConfig.redirectUrl.params);
            const redirectUrl = `${serverConfig.redirectUrl.url}?${redirectParams.toString()}`;
            
            // Log the redirect URL and provide a clickable link
            log('Redirect URL available:', 'info');
            const linkElement = document.createElement('a');
            linkElement.href = redirectUrl;
            linkElement.target = '_blank'; // Open in new tab/window
            linkElement.textContent = 'Click here to open redirect URL';
            linkElement.style.color = '#4285f4';
            linkElement.style.textDecoration = 'underline';
            linkElement.style.cursor = 'pointer';
            
            const linkDiv = document.createElement('div');
            linkDiv.appendChild(linkElement);
            outputDiv.appendChild(linkDiv);
        }
    } catch (error) {
        log(`Server communication error: ${error.message}`, 'error');
        throw error;
    }
}

// Initialize Firebase and request required permissions
async function initializeFirebase() {
    try {
        // Validate Firebase config
        const requiredFields = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
        }

        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        const messaging = firebase.messaging();
        
        // Explicitly set the service worker path for FCM
        await messaging.getToken({
            vapidKey: firebaseConfig.vapidKey,
            serviceWorkerRegistration: await navigator.serviceWorker.register('/FCMListener/firebase-messaging-sw.js', {
                scope: '/FCMListener/'
            })
        });

        if (Notification.permission === 'denied') {
            log('FCM requires notification permission to function.', 'error');
            log('Please enable notifications in your browser settings:', 'info');
            log('1. Click the lock/info icon in your browser\'s address bar', 'info');
            log('2. Find "Notifications" in the permissions list', 'info');
            log('3. Change the setting to "Allow"', 'info');
            throw new Error('Notification permission required for FCM');
        }

        // Request permission if not granted
        if (Notification.permission === 'default') {
            log('FCM requires notification permission to receive messages.', 'info');
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission required for FCM');
            }
        }

        // Get FCM token with explicit service worker registration
        const token = await messaging.getToken();
        log('FCM Token obtained', 'success');
        log(`Token: ${token}`, 'info');

        // Send token to server if configured
        if (serverConfig.serverUrl.url) {
            await sendTokenToServer(token);
        }

        // Set up message handling
        messaging.onMessage((payload) => {
            // Only log to output div, don't show notifications
            log('New message received:', 'info');
            log(JSON.stringify(payload, null, 2), 'info');
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
        
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded. Please check your internet connection and try again.');
        }
        
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