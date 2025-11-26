import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXW1RRyh6f3OaI6oh5OGmF5icDENQ1FK4",
  authDomain: "bookreels-8eb21.firebaseapp.com",
  projectId: "bookreels-8eb21",
  storageBucket: "bookreels-8eb21.firebasestorage.app",
  messagingSenderId: "276859017884",
  appId: "1:276859017884:web:09e0a101137387550fab59",
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// ------------------------------------------------------
// AUTH SETUP
// ------------------------------------------------------
export const auth = getAuth(app);

// ✔ This forces Google to ALWAYS show account picker
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // <--- THE IMPORTANT FIX
});

// ✔ Force Firebase to drop previous session before login
export async function loginWithGoogle() {
  try {
    await signOut(auth); // clear previous login session
  } catch (e) {
    console.warn("No previous session to sign out");
  }
  return signInWithPopup(auth, provider);
}

export const logoutUser = () => signOut(auth);

export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ------------------------------------------------------
// FIRESTORE SETUP
// ------------------------------------------------------
export const db = getFirestore(app);

// LOAD USER DATA
export async function loadUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data(); // {likes, bookmarks, posts}
}

// SAVE USER DATA (merge = true)
export async function saveUserData(uid, data) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data, { merge: true });
}
