import { auth, db, doc, getDoc, signOut } from './firebase-setup.js';

// Log out button functionality.. redirects user to login page
document.getElementById('log-out-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error signing out: ", error);
    }
});

// Home button functionality.. redirects user to petitioner dashboard from the profile page
document.getElementById('home-btn').addEventListener('click', () => {
    window.location.href = 'petitioner-dash.html';
});

// 
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("Fetching document for UID:", user.uid);

        try {
            // Fetch user document from Firestore based on their user ID
            const petitionerDocRef = doc(db, "petitioners", user.uid);
            const petitionerDocSnap = await getDoc(petitionerDocRef);

            //checking if document exists and logging user data for testing
            if (petitionerDocSnap.exists()) {
                const userData = petitionerDocSnap.data();
                console.log("User Full Name:", userData.fullName);
                console.log("User Email:", user.email);

                // Populate user data in the profile section if the document exists
                document.getElementById('full-name').textContent = userData.fullName || 'Full name not provided';
                document.getElementById('email').textContent = userData.email || 'No email provided';
                document.getElementById('dob').textContent = userData.dob || 'No date of birth provided';
                document.getElementById('biometric-id').textContent = userData.biometricId || 'No biometric ID provided';
            } else {
                console.log("No such document in Firestore for UID:", user.uid);
                alert("No profile information available.");
            }
        } catch (error) {
            console.error("Error fetching user document:", error);
            alert("An error occurred while loading your profile. Please try again later.");  
        }
    } else {
        console.log("No user is signed in");
        window.location.href = 'index.html'; // Redirect to login page
    }
});

