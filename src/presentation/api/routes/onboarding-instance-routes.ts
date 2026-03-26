import express from "express"
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

// Temporarily left open for local development so the onboarding UI can be tested
// without requiring Auth0 tokens on the new instance-management flow.
router.get("/api/companies", listCompaniesHandler)
router.get("/api/onboarding-instances", listOnboardingInstancesHandler)
router.post("/api/onboarding-instances", createOnboardingInstanceHandler)
router.post("/api/onboarding-instances/:linkToken/review/complete", completeEquiemReviewHandler)

router.get("/api/public/onboarding/:linkToken", getOnboardingByLinkHandler)
router.patch("/api/public/onboarding/:linkToken/progress", saveOnboardingProgressHandler)
router.post("/api/public/onboarding/:linkToken/submit", submitOnboardingHandler)

export default router
