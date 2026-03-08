import express from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import { getPayload } from "../controllers/user-controllers";

const router = express.Router();

// Protected endpoint: token is validated before controller logic runs.
router.get("/api/users", authMiddleware, getPayload);
export default router;

