const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");

const userAuthRoutes = require("./routes/userAuthRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const reviewerAuthRoutes = require("./routes/reviewerAuthRoutes");
const reviewerProfileRoutes = require("./routes/reviewerProfileRoutes");
const videoRoutes = require("./routes/videoRoutes"); // Import the video routes
const reportRoutes = require('./routes/reportRoutes');
const convertRoutes = require("./routes/convertRoutes");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Swagger setup for API documentation
const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set up routes
app.use("/api/userAuth", userAuthRoutes);
app.use("/api/userProfile", userProfileRoutes);
app.use("/api/reviewerAuth", reviewerAuthRoutes);
app.use("/api/reviewerProfile", reviewerProfileRoutes);
app.use("/api/videos", videoRoutes); // Use the video routes directly
app.use("/api/reports",reportRoutes);
app.use("/api/convert", convertRoutes);

// MongoDB connection
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
