import express from "express"
import { handleUpload } from "../controllers/upload-controller.ts"

const router = express.Router()

router.post("/api/upload", handleUpload)

export default router