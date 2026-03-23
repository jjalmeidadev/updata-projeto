import express from "express"
import { handleUpload } from "../controllers/upload-controller.ts"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post("/api/upload", upload.single("file"), handleUpload)

export default router