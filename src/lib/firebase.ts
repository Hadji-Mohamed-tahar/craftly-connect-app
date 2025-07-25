
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLUEYvJPWtMII7dtwUspbJswtyRKD-sSg",
  authDomain: "craft-b7f21.firebaseapp.com",
  projectId: "craft-b7f21",
  storageBucket: "craft-b7f21.firebasestorage.app",
  messagingSenderId: "601240115871",
  appId: "1:601240115871:web:2f6e828a7742763ea3e0aa",
  measurementId: "G-BTG0G2DQRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
