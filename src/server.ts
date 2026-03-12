import express from "express";
import userRoutes from "./presentation/api/routes/user-routes.ts";
import uploadRoutes from "./presentation/api/routes/upload-routes.ts";

const app = express();

// API endpoints in this app only accept JSON payloads.
// Parse JSON request bodies for API endpoints.
app.use(express.json());

// Mount all user-related API routes.
app.use(userRoutes);

// Mount all upload-related API routes.
app.use(uploadRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});