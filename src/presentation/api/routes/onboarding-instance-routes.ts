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
const onboardingAuth: RequestHandler = (req, res, next) => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

  if (env.DISABLE_ONBOARDING_AUTH === "true") {
    next()
    return
  }

  authMiddleware(req, res, next)
}

router.get("/api/companies", listCompaniesHandler)
router.get("/api/onboarding-instances", onboardingAuth, listOnboardingInstancesHandler)
router.post("/api/onboarding-instances", createOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/review/complete", onboardingAuth, completeEquiemReviewHandler)
router.post("/api/onboarding-instances/:linkToken/approve", onboardingAuth, approveOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/reject", onboardingAuth, rejectOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/sections/:sectionId/decision", onboardingAuth, reviewOnboardingSectionHandler)

router.get("/api/public/onboarding/:linkToken", onboardingAuth, getOnboardingByLinkHandler)
router.get("/api/public/onboarding/:linkToken/review-data", onboardingAuth, getOnboardingReviewDataHandler)
router.patch("/api/public/onboarding/:linkToken/progress", onboardingAuth, saveOnboardingProgressHandler)
router.post("/api/public/onboarding/:linkToken/submit", onboardingAuth, submitOnboardingHandler)

export default router
