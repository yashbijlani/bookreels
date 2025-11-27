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
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

export async function addGlobalPost(data) {
  // data: { text, book, author, genre, color, uid, userName, userPhoto }
  const postsRef = collection(db, "posts");
  const docRef = await addDoc(postsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef; // you can use docRef.id in the UI if needed
}

export async function loadGlobalPosts() {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("createdAt", "asc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function deleteGlobalPost(postId) {
  const ref = doc(db, "posts", postId);
  await deleteDoc(ref);
}