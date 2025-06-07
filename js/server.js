const admin = require("firebase-admin");
const serviceAccount = require("../db_bioid/acctkey.json");
const express = require("express");
const app = express();
const port = 3001;

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.set("json spaces", 2);

//fetch all petitions or open petitions
app.get("/slpp/petitions", async (req, res) => {
  const { status } = req.query;

  try {
    let petitionsQuery = db.collection("petitions");
    // Filter by status if it is provided
    if (status === "open") {
      petitionsQuery = petitionsQuery.where("status", "==", "Open"); // Match exact value
    }
    
    const petitionsSnapshot = await petitionsQuery.get();
    const petitions = petitionsSnapshot.docs.map((doc) => {
      const petition = doc.data();
      delete petition.signedUsers; // Remove the signedUsers field
      return {
        petition_id: petition.petition_id,
        status: petition.status,
        petition_title: petition.petition_title,
        petition_text: petition.petition_text,
        petitioner: petition.petitioner,
        signatures: petition.signatures,
        response: petition.response,
      };
    });
    
    // Send the JSON response
    res.json({ petitions });
  } catch (error) {
    console.error("Error fetching petitions:", error);
    res.status(500).send("Error fetching petitions");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`SLPP REST API is running at http://localhost:${port}`);
});