import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCXax4IsPn-P3MT6HfblPUrHXLctK4j234",
  authDomain: "kinderguard-7a2ec.firebaseapp.com",
  projectId: "kinderguard-7a2ec",
  storageBucket: "kinderguard-7a2ec.appspot.com",
  messagingSenderId: "734531979169",
  appId: "1:734531979169:web:910eaffc6401080573ade0",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const storage = getStorage(app);

const database = getDatabase(app);

const db = getFirestore(app);

export { auth, storage, database, db };
