// ℹ️ Gets access to environment variables/settings
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

// Artist routes
const artistRoutes = require("./routes/artist.routes");
app.use("/artists", artistRoutes);

// Album routes
const albumRoutes = require("./routes/album.routes");
app.use("/albums", albumRoutes);

// Review routes
const reviewRoutes = require("./routes/review.routes");
app.use("/reviews", reviewRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;