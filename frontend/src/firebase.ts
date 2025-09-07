import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Helper to detect mobile (basic check)
function isMobile() {
  return typeof navigator !== "undefined" && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Only initialize analytics if running in a browser
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = () => {
  if (isMobile()) {
    // Use redirect on mobile
    return signInWithRedirect(auth, googleProvider);
  } else {
    // Use popup on desktop
    return signInWithPopup(auth, googleProvider);
  }
};

export const loginWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

// Call this on app start to handle redirect result
export const handleRedirectResult = async () => {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    console.error('Failed redirect result', error);
    throw error;
  }
};

export { auth, db, onAuthStateChanged, type User };
