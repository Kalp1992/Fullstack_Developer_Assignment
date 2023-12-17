const express = require("express");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const HttpError = require("./http-error");
const app = express();
require("dotenv").config({ path: `${process.env.NODE_ENV}.env` });
const PORT = process.env.PORT;

// Set up in-memory database using lowdb
const adapter = new FileSync("db.json");
const db = low(adapter);

// Seed initial data
db.defaults({ users: [] }).write();

app.use(express.json());

// Routes

// Get all items
app.get("/api/users", async (req, res) => {
  const items = await db.get("users").value();
  res.status(200).json(items);
});

// Get a specific item
app.get("/api/users/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    var user = db.get("users").find({ id: userId }).value();
  } catch (err) {
    res.status(400).json({ error: "UserId is not valid." });
  }

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
});

// Create a new item
app.post("/api/users", async (req, res) => {
  const newUser = req.body;
  if (newUser) {
    const addedUser = await db.get("users").push(newUser).write();
    res.status(201).json(addedUser);
  } else {
    res
      .status(400)
      .json({ error: "Request body dows not have corresponding fields." });
  }
});

// Update an existing item
app.put("/api/users/:userId", (req, res) => {
  const userId = parseInt(req.params.id);
  const updatedUser = req.body;
  try {
    var user = db.get("users").find({ id: userId }).assign(updatedUser).write();
  } catch (err) {
    res.status(400).json({ error: "userId is Invalid." });
  }
  res.status(200).json(updatedUser);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
});

// Delete an item
app.delete("/api/users/:userId", (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    var user = db.get("users").remove({ id: userId }).write();
    res.status(204).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "userId is Invalid." });
  }
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
});
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
