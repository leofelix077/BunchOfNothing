import firebase from "firebase";

const config = {
  apiKey: "AIzaSyBxntWXvCQrG0rftoFgOr6VrkIG13UgH-Y",
  authDomain: "bunch-of-nothing.firebaseapp.com",
  databaseURL: "https://bunch-of-nothing.firebaseio.com",
  projectId: "bunch-of-nothing",
  storageBucket: "bunch-of-nothing.appspot.com",
  messagingSenderId: "518710641885",
  appId: "1:518710641885:web:53c12f0b97c7fd62b2c734",
  measurementId: "G-14G4FLN330",
};

firebase.initializeApp(config);

export default firebase;
