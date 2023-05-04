import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBXezQrFTbLtQu_N1Xm3URLQCs8A3U5fG4",
  authDomain: "restuarant-finder-9053d.firebaseapp.com",
  projectId: "restuarant-finder-9053d",
  storageBucket: "restuarant-finder-9053d.appspot.com",
  messagingSenderId: "610148634534",
  appId: "1:610148634534:web:5c4713681f3898f4740967",
  measurementId: "G-75CHKNJ1E1"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase