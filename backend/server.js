const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const apiRoutes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors());

// Body parsing
app.use(express.json());

// API root health & information endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "DevDesk Backend API",
    status: "online",
    port: PORT,
    endpoints: {
      tasks: "/api/tasks",
      focus: "/api/focus",
      stats: "/api/stats",
    },
  });
});

// API routes
app.use("/api", apiRoutes);

// 404 handler for non-existent routes
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "\nMONGODB_URI is not set.\n" +
        "Ensure .env has your MongoDB Atlas connection string.\n"
    );
    process.exit(1);
  }

  try {
    await connectDB(uri);
  } catch (err) {
    console.error("\nCould not connect to MongoDB Atlas:", err.message);
    console.error(
      "Check that: (1) connection string and credentials in .env are correct, and\n" +
        "(2) your current IP address is whitelisted in Atlas Network Access.\n"
    );
    process.exit(1);
  }

  return app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
