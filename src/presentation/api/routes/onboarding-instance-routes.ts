import express from "express"
import { RequestHandler } from "express"
import { authMiddleware } from "../middleware/auth-middleware.js"
import {
  approveOnboardingInstanceHandler,
  completeEquiemReviewHandler,
  createOnboardingInstanceHandler,
  getOnboardingByLinkHandler,
  getOnboardingReviewDataHandler,
  listCompaniesHandler,
  listOnboardingInstancesHandler,
  rejectOnboardingInstanceHandler,
  reviewOnboardingSectionHandler,
  saveOnboardingProgressHandler,
  submitOnboardingHandler,
} from "../controllers/onboarding-instance-controller.js"

const router = express.Router()
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const bypassOnboardingAuth = env.DISABLE_ONBOARDING_AUTH === "true"
const onboardingAuth: RequestHandler = bypassOnboardingAuth
  ? (_req, _res, next) => next()
  : authMiddleware

router.get("/api/companies", listCompaniesHandler)
router.get("/api/onboarding-instances", onboardingAuth, listOnboardingInstancesHandler)
router.post("/api/onboarding-instances", createOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/review/complete", onboardingAuth, completeEquiemReviewHandler)
router.post("/api/onboarding-instances/:linkToken/approve", onboardingAuth, approveOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/reject", onboardingAuth, rejectOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/sections/:sectionId/decision", onboardingAuth, reviewOnboardingSectionHandler)

router.get("/api/public/onboarding/:linkToken", getOnboardingByLinkHandler)
router.get("/api/public/onboarding/:linkToken/review-data", getOnboardingReviewDataHandler)
router.patch("/api/public/onboarding/:linkToken/progress", saveOnboardingProgressHandler)
router.post("/api/public/onboarding/:linkToken/submit", submitOnboardingHandler)

export default router
