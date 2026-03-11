import express from "express";
import userRoutes from "./presentation/api/routes/user-routes.ts";

const app = express();

// Parse JSON request bodies for API endpoints.
app.use(express.json());

// Mount all user-related API routes.
app.use(userRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});