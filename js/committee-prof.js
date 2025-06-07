import { auth, signOut } from './firebase-setup.js';

// Log out button - when committee member clicks, they are signed out
document.getElementById('log-out-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out");
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error signing out: ", error);
    }
});