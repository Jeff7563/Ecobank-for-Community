// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 👇 เอา Config มาใส่ตรงนี้
    const firebaseConfig = {
        apiKey: "AIzaSyAroaPsY3v1oY-qJvsaaReCUe6y9DRD99w",
        authDomain: "ecobank-3ccfe.firebaseapp.com",
        projectId: "ecobank-3ccfe",
        storageBucket: "ecobank-3ccfe.firebasestorage.app",
        messagingSenderId: "19205702154",
        appId: "1:19205702154:web:fb792d20286c02d28955f3",
        measurementId: "G-HVJR07ZHYZ"
    };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);