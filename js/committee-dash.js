import { db, signOut, auth } from './firebase-setup.js';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

// Log out functionality for committee members
document.getElementById('log-out-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out");
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error signing out: ", error);
    }
});

async function reloadTable() 
// Load petitions from Firestore and display in the table
{
    const querySnapshot = await getDocs(collection(db, 'petitions'));
    const tbody = document.querySelector('#petition-table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    // Get the signature threshold from Firestore
    const thresholdDoc = await getDoc(doc(db, 'settings', 'signatureThreshold'));
    const threshold = thresholdDoc.exists() ? thresholdDoc.data().value : 0;

    // Loop through each petition and display in the table
    querySnapshot.forEach((doc) => 
        {
        const petition = doc.data();
        const petitionId = doc.id;

        let committeeResponse = petition.response || ''; // Actual response
        let defaultResponse = 'No response yet'; // Placeholder for UI
        let responseCell = committeeResponse || defaultResponse;
        
        // If the petition is open, has enough signatures, and no response yet, show a "Respond" button
        if (petition.status === 'Open' && petition.signatures >= threshold && !committeeResponse) {
            responseCell = `
                <span style="color: red;">
                    Signature threshold reached, <br>
                    response required
                </span>
                <br>
                <button class="respond-btn" data-id="${petitionId}">Respond</button>
            `;
        }
        
        // Display the number of signatures, and indicate if a response is required or if the petition is closed
        let signaturesCell = petition.signatures;
        if (petition.signatures && petition.signatures.length >= threshold && petition.status === 'Open') {
            signaturesCell += `
            <span style="color: red;">
            <strong>(Committee response required!)</strong>
            </span>`;
        } else if (petition.status === 'Closed') {
            signaturesCell += ' <strong>****** PETITION CLOSED</strong>';
        }

        // Create a row for each petition in the table
        const row = `
            <tr>
                <td>${petition.petition_title}</td>
                <td>${petition.petition_text}</td>
                <td>${petition.status}</td>
                <td class="response-cell" data-id="${petitionId}">${responseCell}</td>
                <td>${signaturesCell}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Reattach event listeners for the respond buttons after reloading the table
    attachRespondButtonListeners();
}

// Attach event listeners to "Respond" buttons - open the response popup when clicked 
function attachRespondButtonListeners() {
    document.querySelectorAll('.respond-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const petitionId = event.target.getAttribute('data-id');
            document.getElementById('response-popup').style.display = 'flex';
            document.getElementById('submit-response-btn').setAttribute('data-id', petitionId);
        });
    });
}

// Handle submitting a response - update the petition in Firestore with the response
document.getElementById('submit-response-btn').addEventListener('click', async () => {
    const petitionId = document.getElementById('submit-response-btn').getAttribute('data-id');
    const response = document.getElementById('response-text').value;

    if (response) {
        const petitionRef = doc(db, 'petitions', petitionId);

        try {
            // Update Firestore
            await updateDoc(petitionRef, {
                response: response,
                status: 'Closed' // Close the petition after responding
            });

            alert('Response submitted successfully!');

            // Close the popup and clear input
            document.getElementById('response-popup').style.display = 'none';
            document.getElementById('response-text').value = '';

            // Reload the table to fetch updated data from Firestore
            await reloadTable();
        } catch (error) {
            console.error('Error updating response:', error);
            alert('Failed to submit response. Please try again.');
        }
    } else {
        alert('Please enter a response.');
    }
});

// Close the popup
document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('response-popup').style.display = 'none';
    document.getElementById('response-text').value = ''; // Clear the text area
});

// Load petitions on page load
document.addEventListener('DOMContentLoaded', () => {
    reloadTable();
});

// Handle setting the signature threshold - update the threshold in Firestore
document.getElementById('set-threshold-btn').addEventListener('click', async () => {
    const threshold = document.getElementById('signature-threshold').value;
    if (threshold) 
        // Check if a threshold value is entered
        {
        try 
        {
            await setDoc(doc(db, 'settings', 'signatureThreshold'), {
                value: parseInt(threshold, 10)
            });
            alert('Signature threshold set successfully!');
        } catch (error) {
            console.error('Error setting threshold: ', error);
            alert('Failed to set threshold. Please try again.');
        }
    } else {
        alert('Please enter a threshold value.');
    }
});

// Check if any petition has reached the threshold
async function checkThreshold() 
{
    const settings = await getDoc(doc(db, 'settings', 'signatureThreshold'));
    // Get the signature threshold from Firestore - if it exists, check each petition
    if (settings.exists()) {
        const threshold = settings.data().value;
        const querySnapshot = await getDocs(collection(db, 'petitions'));
        querySnapshot.forEach(async (doc) => {
            const petition = doc.data();

            // If the petition has enough signatures and is open, update it with a response required
            if (petition.signatures && petition.signatures.length >= threshold && petition.status === 'Open') {
                await updateDoc(doc.ref, 
                {
                    response: 'Signature threshold reached, response required'
                });
            }
        });
    }
}

// Run the threshold check periodically
setInterval(checkThreshold, 60000); // Check every minute
