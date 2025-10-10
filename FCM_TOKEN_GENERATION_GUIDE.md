# 🔥 FCM Token Generation Guide - Complete Implementation

## 📱 **How to Get FCM Token**

The FCM token is a unique identifier for each device/app installation that allows Firebase to send push notifications to that specific device.

## 🚀 **Platform-Specific Implementation**

### 1. **Android (Flutter/Dart)**

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

class FCMService {
  static Future<String?> getFCMToken() async {
    try {
      // Request permission for notifications
      NotificationSettings settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        // Get FCM token
        String? token = await FirebaseMessaging.instance.getToken();
        print('FCM Token: $token');
        return token;
      }
    } catch (e) {
      print('Error getting FCM token: $e');
    }
    return null;
  }

  // Register token with your API
  static Future<void> registerTokenWithAPI(String token) async {
    try {
      final response = await http.post(
        Uri.parse('http://103.14.120.163:8081/api/notifications/register-fcm-token'),
        headers: {
          'Authorization': 'Bearer YOUR_JWT_TOKEN',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'fcmToken': token,
          'deviceType': 'android',
          'appVersion': '1.0.0',
        }),
      );

      if (response.statusCode == 200) {
        print('FCM token registered successfully');
      }
    } catch (e) {
      print('Error registering FCM token: $e');
    }
  }
}

// Usage in your app
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Get and register FCM token
  String? token = await FCMService.getFCMToken();
  if (token != null) {
    await FCMService.registerTokenWithAPI(token);
  }
}
```

### 2. **iOS (Swift)**

```swift
import Firebase
import FirebaseMessaging

class FCMService {
    static func getFCMToken() {
        // Request permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    // Get FCM token
                    Messaging.messaging().token { token, error in
                        if let error = error {
                            print("Error fetching FCM token: \(error)")
                        } else if let token = token {
                            print("FCM Token: \(token)")
                            registerTokenWithAPI(token: token)
                        }
                    }
                }
            }
        }
    }
    
    static func registerTokenWithAPI(token: String) {
        let url = URL(string: "http://103.14.120.163:8081/api/notifications/register-fcm-token")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer YOUR_JWT_TOKEN", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "fcmToken": token,
            "deviceType": "ios",
            "appVersion": "1.0.0"
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error registering FCM token: \(error)")
            } else {
                print("FCM token registered successfully")
            }
        }.resume()
    }
}

// Usage in AppDelegate
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        FirebaseApp.configure()
        FCMService.getFCMToken()
        return true
    }
}
```

### 3. **Web (JavaScript)**

```javascript
// firebase-messaging-sw.js (Service Worker)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "rgram-notifiaction.firebaseapp.com",
  projectId: "rgram-notifiaction",
  storageBucket: "rgram-notifiaction.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

```javascript
// main.js (Main application)
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "rgram-notifiaction.firebaseapp.com",
  projectId: "rgram-notifiaction",
  storageBucket: "rgram-notifiaction.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Get FCM token
async function getFCMToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'your-vapid-key'
      });
      
      if (token) {
        console.log('FCM Token:', token);
        await registerTokenWithAPI(token);
      }
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

// Register token with your API
async function registerTokenWithAPI(token) {
  try {
    const response = await fetch('http://103.14.120.163:8081/api/notifications/register-fcm-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken: token,
        deviceType: 'web',
        appVersion: '1.0.0',
      }),
    });

    if (response.ok) {
      console.log('FCM token registered successfully');
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  
  // Show notification
  if (payload.notification) {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/firebase-logo.png'
    });
  }
});

// Initialize FCM
getFCMToken();
```

### 4. **React Native**

```javascript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class FCMService {
  static async getFCMToken() {
    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Get FCM token
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  }

  static async registerTokenWithAPI(token) {
    try {
      const response = await fetch('http://103.14.120.163:8081/api/notifications/register-fcm-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fcmToken: token,
          deviceType: Platform.OS,
          appVersion: '1.0.0',
        }),
      });

      if (response.ok) {
        console.log('FCM token registered successfully');
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }
}

// Usage in App.js
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const initializeFCM = async () => {
      const token = await FCMService.getFCMToken();
      if (token) {
        await FCMService.registerTokenWithAPI(token);
      }
    };

    initializeFCM();
  }, []);

  return (
    // Your app components
  );
}
```

## 🧪 **Testing FCM Token Generation**

### **Test Script for API**

```javascript
// test-fcm-token.js
const axios = require('axios');

async function testFCMTokenRegistration() {
  try {
    console.log('🧪 Testing FCM Token Registration...');
    
    // Test with a sample FCM token
    const testToken = 'test-fcm-token-' + Date.now();
    
    const response = await axios.post('http://103.14.120.163:8081/api/notifications/register-fcm-token', {
      fcmToken: testToken,
      deviceType: 'android',
      appVersion: '1.0.0'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ FCM Token Registration Successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ FCM Token Registration Failed:', error.response?.data || error.message);
  }
}

testFCMTokenRegistration();
```

### **cURL Commands for Testing**

```bash
# Register FCM Token
curl -X POST http://103.14.120.163:8081/api/notifications/register-fcm-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "test-fcm-token-12345",
    "deviceType": "android",
    "appVersion": "1.0.0"
  }'

# Send Push Notification
curl -X POST http://103.14.120.163:8081/api/notifications/send-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "USER_ID",
    "title": "Test Notification",
    "body": "This is a test push notification!",
    "type": "test"
  }'
```

## 🔧 **Firebase Configuration Files**

### **Android (google-services.json)**
```json
{
  "project_info": {
    "project_number": "106426579807094702598",
    "project_id": "rgram-notifiaction"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "your-app-id",
        "android_client_info": {
          "package_name": "com.rgram.app"
        }
      }
    }
  ]
}
```

### **iOS (GoogleService-Info.plist)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>PROJECT_ID</key>
    <string>rgram-notifiaction</string>
    <key>GOOGLE_APP_ID</key>
    <string>your-app-id</string>
</dict>
</plist>
```

## 📱 **Complete Integration Flow**

1. **App Starts** → Initialize Firebase
2. **Request Permission** → Ask user for notification permission
3. **Get FCM Token** → Generate unique device token
4. **Register Token** → Send token to your API
5. **Store Token** → Save in user's database record
6. **Send Notifications** → Use token to send push notifications

## 🎯 **Key Points**

- **FCM Token is unique** for each app installation
- **Token can change** when app is reinstalled or restored
- **Always request permission** before getting token
- **Register token immediately** after getting it
- **Handle token refresh** for long-running apps
- **Test on real devices** for accurate results

Your Firebase setup is already complete and ready to use! 🚀
