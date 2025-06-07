import { auth, signOut, db, getDoc, addDoc, collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "./firebase-setup.js";

//log out functionality - signs out the user and redirects to the log in page
document.getElementById('log-out-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out");
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error signing out: ", error);
    }
});

//profile button - redirects to the petitioner profile page from the dashboard
document.getElementById('profile-btn').addEventListener('click', () => {
    window.location.href = 'petitioner-prof.html';
});

//tab functionality - allows the user to switch between tabs (all petitions and my petitions)
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
    });
});

//all petitions button - displays all petitions in the database
document.getElementById('all-petitions-btn').addEventListener('click', async function() {
    const q = query(collection(db, 'petitions'));
    const querySnapshot = await getDocs(q);
    const tbody = document.querySelector('#petition-table tbody');
    tbody.innerHTML = ''; // Clear existing rows
    querySnapshot.forEach((doc) => {
        const petition = doc.data();
        const user = auth.currentUser;
        let actionCell = ''; //if the petition is closed, the user cannot sign it
        if (petition.status === 'Closed') {
            actionCell = '<td><strong>Not accepting any more signatures</strong></td>';
        } else if (user && petition.userId === user.uid) {
            //if the user created the petition, they cannot sign it
            actionCell = '<td><strong>You cannot sign a petition you created</strong></td>';
        } else 
        {
            actionCell = `<td><button class="sign-petition-btn" data-id="${doc.id}">Sign Petition</button></td>`;
        }
        //creates a row for each petition in the database
        const row = `<tr>
            <td>${petition.petition_title}</td>
            <td>${petition.petition_text}</td>
            <td>${petition.status}</td>
            <td>${petition.response || 'No response yet'}</td>
            <td>${petition.signatures || 0}</td>
            ${actionCell}
        </tr>`;
        tbody.innerHTML += row;
    });
    //displays the petition table
    document.getElementById('petition-table').style.display = 'table';
    document.getElementById('petition-table-title').style.display = 'block';
    document.getElementById('petition-table-title').innerText = 'All Petitions';
    document.getElementById('action-header').style.display = 'table-cell';

    //sign petition button - allows the user to sign a petition
    document.querySelectorAll('.sign-petition-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const petitionId = event.target.getAttribute('data-id');
            const user = auth.currentUser;
            if (user) {
                const petitionRef = doc(db, 'petitions', petitionId);
                const petitionDoc = await getDoc(petitionRef);
                if (petitionDoc.exists()) {
                    const petitionData = petitionDoc.data();
                    if (petitionData.status === 'Closed') {
                        alert('This petition is closed and not accepting any more signatures.');
                    } else if (!petitionData.signedUsers || !petitionData.signedUsers.includes(user.uid)) {
                        await updateDoc(petitionRef, {
                            signatures: (petitionData.signatures || 0) + 1,
                            signedUsers: arrayUnion(user.uid)
                        });
                        alert('Petition signed successfully!');
                        // Update the signatures count in the UI
                        event.target.parentElement.previousElementSibling.innerText = (petitionData.signatures || 0) + 1;
                    } else {
                        alert('You have already signed this petition.');
                    }
                } else {
                    alert('Petition not found.');
                }
            } else {
                alert('User not authenticated');
            }
        });
    });
});

//my petitions button - displays the petitions created by the user
document.getElementById('my-petitions-btn').addEventListener('click', async function() {
    const user = auth.currentUser;
    if (user) {
        const q = query(collection(db, 'petitions'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const tbody = document.querySelector('#petition-table tbody');
        tbody.innerHTML = ''; // Clear existing rows
        querySnapshot.forEach((doc) => {
            const petition = doc.data();
            const row = `<tr>
                <td>${petition.petition_title}</td>
                <td>${petition.petition_text}</td>
                <td>${petition.status}</td>
                <td>${petition.response || 'No response yet'}</td>
                <td>${petition.signatures}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
        document.getElementById('petition-table').style.display = 'table';
        document.getElementById('petition-table-title').style.display = 'block';
        document.getElementById('petition-table-title').innerText = 'My Petitions';
        document.getElementById('action-header').style.display = 'none';
    } else {
        alert('User not authenticated');
    }
});

//create petition button - allows the user to create a petition
document.getElementById('create-petition-btn').addEventListener('click', async () => {
    const title = document.getElementById('petition-title').value;
    const content = document.getElementById('petition-content').value;

    //creates a new petition with the title and content entered by the user
    if (title && content) {
        try {
            const user = auth.currentUser;
            if (user) {
                // Get the current highest petition ID
                const petitionsSnapshot = await getDocs(collection(db, 'petitions'));
                let maxId = 0;
                petitionsSnapshot.forEach((doc) => {
                    const petition = doc.data();
                    if (petition.petition_id > maxId) {
                        maxId = petition.petition_id;
                    }
                });

                // Assign a new ID
                const newPetitionId = maxId + 1;

                //adds the new petition to the database
                await addDoc(collection(db, 'petitions'), {
                    petition_id: newPetitionId,
                    petitioner: user.email,
                    petition_title: title,
                    petition_text: content,
                    userId: user.uid,
                    status: 'Open',
                    createdAt: new Date(),
                    signatures: 0,
                    signedUsers: []
                });
                alert('Petition created successfully!');
                document.getElementById('petition-title').value = '';
                document.getElementById('petition-content').value = '';
            } else {
                alert('User not authenticated');
            }
        } catch (error) {
            console.error('Error creating petition: ', error);
            alert('Error creating petition');
        }
    } else {
        alert('Please enter both your petition title and content.');
    }
});