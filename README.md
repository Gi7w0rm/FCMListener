# Firebase Cloud Messaging (FCM) Web Client

A web-based client application for testing and monitoring Firebase Cloud Messaging (FCM) functionality. This application allows users to configure Firebase settings, receive push notifications, and monitor message delivery.

## Project Structure

```
fcm-web/
├── index.html          # Main HTML interface
├── style.css           # Application styles
├── script.js           # Main application logic
├── app.js              # Firebase initialization and configuration
└── firebase-messaging-sw.js  # Service worker for handling background messages
```

## Components

### 1. index.html
The main interface containing:
- Firebase configuration inputs (API Key, Project ID, Messaging Sender ID, App ID)
- Server configuration inputs (Server URL, Redirect URL, Additional Parameters)
- Connect and Clear Output buttons
- Output display area for logs and messages

### 2. style.css
Styling for the application including:
- Responsive design
- Color scheme and typography
- Form and button styles
- Log output formatting
- Parameter input styling

### 3. script.js
Core FCM functionality implementation:

#### Functions

##### `log(message, type = 'info')`
- **Purpose**: Displays messages in the output container
- **Input**:
  - `message`: String to display
  - `type`: Log type ('info', 'success', 'error')
- **Output**: None
- **Side Effects**: Updates the output container with formatted message

##### `registerServiceWorker()`
- **Purpose**: Registers the Firebase service worker
- **Input**: None
- **Output**: Service worker registration object
- **Side Effects**: 
  - Registers service worker
  - Sends Firebase configuration to service worker

##### `initializeFirebase()`
- **Purpose**: Initializes Firebase with user-provided configuration
- **Input**: None
- **Output**: Boolean indicating success/failure
- **Side Effects**:
  - Initializes Firebase app
  - Sets up messaging instance
  - Logs initialization status
  - Sends token to server if configured

##### `getToken()`
- **Purpose**: Requests notification permission and gets FCM token
- **Input**: None
- **Output**: FCM token string or null
- **Side Effects**:
  - Requests notification permission
  - Logs token or error
  - Sends token to server if configured

##### `sendTokenToServer(token)`
- **Purpose**: Sends FCM token to configured server endpoint
- **Input**: FCM token string
- **Output**: None
- **Side Effects**:
  - Sends POST request to server
  - Stores token in localStorage
  - Handles redirect if configured
  - Logs server response or error

##### `updateServerParams()`
- **Purpose**: Updates server parameters from UI inputs
- **Input**: None
- **Output**: None
- **Side Effects**: Updates serverConfig.params array

### 4. app.js
Firebase configuration and message handling:

#### Functions

##### `initializeFirebase(config)`
- **Purpose**: Initializes Firebase with provided configuration
- **Input**: Firebase configuration object
- **Output**: Boolean indicating success/failure
- **Side Effects**: Sets up Firebase app and messaging instance

##### `getToken()`
- **Purpose**: Gets FCM token after permission check
- **Input**: None
- **Output**: FCM token string or null
- **Side Effects**: Logs token or error

##### `setupMessageHandling()`
- **Purpose**: Sets up message and token refresh handlers
- **Input**: None
- **Output**: None
- **Side Effects**: 
  - Sets up message handler
  - Sets up token refresh handler
  - Logs received messages

### 5. firebase-messaging-sw.js
Service worker for handling background messages:

#### Functions

##### Background Message Handler
- **Purpose**: Handles messages received when app is in background
- **Input**: Message payload
- **Output**: None
- **Side Effects**: 
  - Creates notification
  - Logs message details

##### Notification Click Handler
- **Purpose**: Handles notification clicks
- **Input**: Click event
- **Output**: None
- **Side Effects**: Opens URL if specified in notification data

## Data Flow

1. **Initialization**:
   - User enters Firebase configuration
   - User enters server configuration (optional)
   - Service worker is registered
   - Firebase is initialized with configuration

2. **Token Generation**:
   - User clicks "Connect"
   - Notification permission is requested
   - FCM token is generated and displayed
   - Token is sent to server if configured

3. **Message Handling**:
   - Foreground messages: Handled by `onMessage` in app.js
   - Background messages: Handled by service worker
   - Token refresh: Handled by `onTokenRefresh` in app.js
   - Token updates are sent to server if configured

## Usage

1. Enter Firebase configuration details:
   - API Key
   - Project ID
   - Messaging Sender ID
   - App ID

2. (Optional) Enter server configuration:
   - Server URL (required for token subscription)
   - Redirect URL (optional)
   - Additional parameters (optional)

3. Click "Connect" to:
   - Initialize Firebase
   - Request notification permission
   - Generate FCM token
   - Send token to server (if configured)
   - Start monitoring for messages

4. Monitor the output area for:
   - Connection status
   - FCM tokens
   - Server responses
   - Received messages
   - Error messages

## Dependencies

- Firebase SDK (v9.x.x)
  - firebase-app-compat.js
  - firebase-messaging-compat.js

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari (limited support)

## Security Considerations

1. Firebase configuration should be kept secure
2. API keys should not be exposed in production
3. HTTPS is required for service workers
4. Notification permissions are required for FCM functionality
5. Server endpoints should be validated
6. Additional parameters should be sanitized

## Error Handling

The application includes comprehensive error handling for:
- Firebase initialization failures
- Permission denials
- Token generation issues
- Service worker registration problems
- Message delivery failures
- Server communication errors
- Parameter validation

## Logging

The application provides detailed logging for:
- Configuration changes
- Connection status
- Token generation
- Server communication
- Message reception
- Error conditions

All logs include timestamps and are color-coded by type (info, success, error). 