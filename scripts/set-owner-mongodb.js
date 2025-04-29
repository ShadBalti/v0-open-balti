// MongoDB shell commands to set a user as owner, verified, and founder
// Run this in MongoDB shell or MongoDB Compass

// Replace 'your@email.com' with your actual email
// Assuming 'db' is available in the MongoDB shell environment.
// If not, you might need to connect to the database first.
// For example:
// const { MongoClient } = require('mongodb');
// const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB URI
// const client = new MongoClient(uri);
// await client.connect();
// const db = client.db('your_database_name'); // Replace with your database name

db.users.updateOne(
  { email: "your@email.com" },
  {
    $set: {
      isVerified: true,
      isFounder: true,
      role: "owner",
    },
  },
)

// Verify the update
db.users.findOne({ email: "your@email.com" })
