// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBn7ntccAw2YxI4JeYR9e5P2RT4DuXf0Bo",
  authDomain: "grab-it-50084.firebaseapp.com",
  databaseURL: "https://grab-it-50084.firebaseio.com",
  projectId: "grab-it-50084",
  storageBucket: "grab-it-50084.appspot.com",
  messagingSenderId: "349129597936",
  appId: "1:349129597936:web:f5a909688e57771936f335",
};

firebase.initializeApp(firebaseConfig);

export const firebaseAuth = firebase.auth();

export const firestore = firebase.firestore();

export const storageRef = firebase.storage().ref();

export default firebase;
