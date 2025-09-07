# Firebase Setup Instructions

## 1. Environment Variables
Create a `.env` file in the `frontend` directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 2. Firebase Console Setup

### Authentication
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Email/Password authentication
3. Enable Google sign-in (optional for web, disabled on mobile in this app)

### Firestore Database
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Deploy the security rules from `firestore.rules` file:

```bash
firebase deploy --only firestore:rules
```

### Security Rules
The app uses the following Firestore security rules (see `firestore.rules`):
- Users can only access their own data
- Each document must have a `userId` field matching the authenticated user's ID

## 3. Data Structure

### Collections:
- `clothing_items`: Stores all clothing items for pressing management
- `clothing_types`: Stores custom clothing types per user

### Local Storage:
- Images are stored locally using the browser's file storage (no upload to Firebase Storage)

## 4. Mobile Considerations

### Google Sign-in
- Google sign-in is disabled on mobile devices to avoid redirect issues
- Only email/password authentication is available on mobile
- For native Google sign-in, you would need to implement Capacitor Firebase Auth plugin

### Images
- Images are stored as base64 data URLs locally
- No cloud storage is used for images to keep the setup simple
