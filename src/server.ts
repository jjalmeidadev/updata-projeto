import express from "express";
import dotenv from "dotenv";
import userRoutes from "./presentation/api/routes/user-routes.ts";
import uploadRoutes from "./presentation/api/routes/upload-routes.ts";
import onboardingInstanceRoutes from "./presentation/api/routes/onboarding-instance-routes.ts";

// Load local env values (including AUTH0_*) before routes initialize.
dotenv.config({ path: "config/.env" });

const app = express();

// API endpoints in this app only accept JSON payloads.
// Parse JSON request bodies for API endpoints.
app.use(express.json());

// Mount all user-related API routes.
app.use(userRoutes);

// Mount all upload-related API routes.
app.use(uploadRoutes);

// Mount onboarding instance routes for dashboard, creation and public link flows.
app.use(onboardingInstanceRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
