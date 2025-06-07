import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { db, collection, doc, setDoc, query, where, getDocs } from "./firebase-setup.js";

const auth = getAuth();
let loginType = ''; // 'petitioner' or 'committee'

// On click of the petitioner or committee button, show the login or register popup
document.getElementById('petitioner-btn').addEventListener('click', () => {
    loginType = 'petitioner';
    document.getElementById('register-popup').style.display = 'flex';
    document.getElementById('register-fields').style.display = 'block';
    document.getElementById('login-fields').style.display = 'none';
    document.getElementById('popup-title').textContent = 'Register';
});

document.getElementById('committee-btn').addEventListener('click', () => {
    loginType = 'committee';
    document.getElementById('register-popup').style.display = 'flex';
    document.getElementById('register-fields').style.display = 'none';
    document.getElementById('login-fields').style.display = 'block';
    document.getElementById('popup-title').textContent = 'Login';
});

// Close the popup when the close button is clicked
document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('register-popup').style.display = 'none';
});

// Close the popup when the user clicks outside the popup
document.getElementById('register-popup').addEventListener('click', (event) => {
    if (event.target === document.getElementById('register-popup')) {
        document.getElementById('register-popup').style.display = 'none';
    }
});

// Switch to the login form when the 'Switch to login' link is clicked
document.getElementById('switch-to-login').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('register-fields').style.display = 'none';
    document.getElementById('login-fields').style.display = 'block';
    document.getElementById('popup-title').textContent = 'Login';
});

// Prefill the email field on page load
document.addEventListener("DOMContentLoaded", () => {
    const lastUsername = getUsernameCookie();
    if (lastUsername) {
      document.getElementById("email").value = lastUsername; // Autofill the email field
    }
  });
  
  // Save the email to a cookie 
  function setUsernameCookie(email) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30); // Cookie expires in 30 days
    document.cookie = `lastUsername=${encodeURIComponent(email)}; expires=${expireDate.toUTCString()}; path=/`;
  }
  
  // Get the email from the cookie
  function getUsernameCookie() {
    const cookies = document.cookie.split("; ");
    const lastUsernameCookie = cookies.find((row) => row.startsWith("lastUsername="));
    return lastUsernameCookie ? decodeURIComponent(lastUsernameCookie.split("=")[1]) : null;
  }
  
  // On click of the sign-in button, sign in the user
document.getElementById('sign-in-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    setUsernameCookie(email); 
       
    try {
        // Check if the email and password are valid for the committee login
        if (loginType === 'committee' && (email !== 'admin@petition.parliament.sr' || password !== '2025%shangrila')) {
            throw new Error('Invalid committee login credentials');
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in: ", user.email);
       
        // Check if the user is a committee member trying to log into the petitioner dashboard
        if (loginType === 'petitioner' && (email === 'admin@petition.parliament.sr' && password === '2025%shangrila')) {
            throw new Error('Committee login details cannot be used to log into the petitioner dashboard');
        }
        // Redirect the user to the appropriate dashboard
        if (loginType === 'petitioner') {
            window.location.href = 'petitioner-dash.html';
        } else if (loginType === 'committee') {
            window.location.href = 'committee-dash.html';
        }
    } catch (error) {
        console.error("Error signing in: ", error);
        alert(error.message);
    }
});

// On click of the sign-up button, sign up the user and save their information to Firestore
document.getElementById('sign-up-btn').addEventListener('click', async () => {
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const dob = document.getElementById('dob').value;
    const biometricId = document.getElementById('biometric-id').value.trim();

    try {
        // Check if any of the fields are empty and throw an error if they are
        if (!fullName || !email || !password || !dob || !biometricId) 
            {
            throw new Error('All fields are required');
        }
        // Check if the biometric ID exists in the database
        const q = query(collection(db, "biometric_ids"), where("code", "==", biometricId));
        const queryQ= await getDocs(q);
        if (queryQ.empty) {
            throw new Error('Invalid Biometric ID. Please enter a valid BioID.');
        }


        // Check if the biometric ID is already linked to another user
        const j = query(collection(db, "petitioners"), where("biometricId", "==", biometricId));
        const queryJ = await getDocs(j);
        if (!queryJ.empty) {
            throw new Error('Biometric ID already linked to another user.');
        }
        // Create a new user with the email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("User signed up: ", user.email, user.uid);
        
        // Save user information to Firestore
        await setDoc(doc(db, "petitioners", user.uid), {
            fullName: fullName,
            email: user.email,
            dob: dob,
            biometricId: biometricId,
            timestamp: new Date()
        });
        alert('Account created successfully!');
        document.getElementById('register-popup').style.display = 'none';
        window.location.href = 'petitioner-dash.html';
    } catch (error) {
        console.error("Error signing up: ", error.message);
        alert('Error creating account: ' + error.message);
    }
});

// On click of the log out button, sign out the user and redirect them to the login page
const logOutBtn = document.getElementById('log-out-btn');
if (logOutBtn) {
    logOutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("User signed out");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    });
}
