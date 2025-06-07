// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, getDoc, doc, getDocs, query, where, updateDoc, arrayUnion } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

//Firebase configuration
const firebaseConfig = {
  "replace with your own"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to add a document to Firestore and test if db set up correctly
// export async function addEmailToFirestore(email) 
// {
//     try {
//         const docRef = await addDoc(collection(db, "emails"), {
//             email: email,
//             timestamp: new Date()
//         });
//         console.log("Document written with ID: ", docRef.id);
//     } catch (e) {
//         console.error("Error adding document: ", e);
//     }
// }
export { app, auth, db, signOut, collection, addDoc, setDoc, getDoc, doc, getDocs, query, where, updateDoc, arrayUnion};
