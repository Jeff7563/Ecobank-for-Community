// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TODO: เอาค่า Config จากขั้นตอนที่ 4 มาวางทับตรงนี้
const firebaseConfig = {
    apiKey: "AIzaSyBwVUncfWFcoL_xEKbHbF_04skwlEM7FuA", 
    authDomain: "ecobank-community.firebaseapp.com",
    projectId: "ecobank-community",
    storageBucket: "ecobank-community.firebasestorage.app",
    messagingSenderId: "60273074196",
    appId: "1:60273074196:web:61f01e131b153b213dc701"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ส่งออกตัวแปรเพื่อให้ไฟล์อื่นเรียกใช้ได้
export { app, db, auth };