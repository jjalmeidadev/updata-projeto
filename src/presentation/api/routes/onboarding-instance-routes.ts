import express from "express"
import { RequestHandler } from "express"
import { authMiddleware } from "../middleware/auth-middleware.js"
import {
  completeEquiemReviewHandler,
  createOnboardingInstanceHandler,
  getOnboardingByLinkHandler,
  listCompaniesHandler,
  listOnboardingInstancesHandler,
  saveOnboardingProgressHandler,
  submitOnboardingHandler,
} from "../controllers/onboarding-instance-controller.js"

const router = express.Router()
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const bypassOnboardingAuth = env.DISABLE_ONBOARDING_AUTH === "true"
const onboardingAuth: RequestHandler = bypassOnboardingAuth
  ? (_req, _res, next) => next()
  : authMiddleware

router.get("/api/companies", onboardingAuth, listCompaniesHandler)
router.get("/api/onboarding-instances", onboardingAuth, listOnboardingInstancesHandler)
router.post("/api/onboarding-instances", onboardingAuth, createOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/review/complete", onboardingAuth, completeEquiemReviewHandler)

router.get("/api/public/onboarding/:linkToken", getOnboardingByLinkHandler)
router.patch("/api/public/onboarding/:linkToken/progress", saveOnboardingProgressHandler)
router.post("/api/public/onboarding/:linkToken/submit", submitOnboardingHandler)

export default router
