import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBD6WEnbjPsSUsXBl1ICnokW67FztG06eU",
  authDomain: "coding-app-learn-to-code.firebaseapp.com",
  databaseURL: "https://coding-app-learn-to-code-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "coding-app-learn-to-code",
  storageBucket: "coding-app-learn-to-code.appspot.com",
  messagingSenderId: "108115234560",
  appId: "1:108115234560:web:3b817ce31f08d94e846de5",
  measurementId: "G-HP0JB38HGK"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const dbRef = ref(database);
