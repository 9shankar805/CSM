// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMfK4X5GGUgwArfvYDmls2MAXNySu_Axw",
    authDomain: "mrpr0c0d.firebaseapp.com",
    databaseURL: "https://mrpr0c0d-default-rtdb.firebaseio.com",
    projectId: "mrpr0c0d",
    storageBucket: "mrpr0c0d.appspot.com",
    messagingSenderId: "172380062381",
    appId: "1:172380062381:web:2f6aecbdbe01ed1cab7c24",
    measurementId: "G-M5ZBW3HRDV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();
