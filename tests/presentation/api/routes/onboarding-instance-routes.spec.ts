import { beforeEach, describe, expect, it, vi } from "vitest"
import express from "express"

const routerGetMock = vi.fn()
const routerPatchMock = vi.fn()
const routerPostMock = vi.fn()
const routerMock = {
  get: routerGetMock,
  patch: routerPatchMock,
  post: routerPostMock,
}

const authMiddlewareMock = vi.fn()
const listCompaniesMock = vi.fn()
const listOnboardingInstancesMock = vi.fn()
const createOnboardingInstanceMock = vi.fn()
const completeEquiemReviewMock = vi.fn()
const getOnboardingByLinkMock = vi.fn()
const getOnboardingReviewDataMock = vi.fn()
const saveOnboardingProgressMock = vi.fn()
const submitOnboardingMock = vi.fn()

vi.mock("express", () => ({
  default: {
    Router: vi.fn(() => routerMock),
  },
}))

vi.mock("../../../../src/presentation/api/middleware/auth-middleware.js", () => ({
  authMiddleware: authMiddlewareMock,
}))

vi.mock("../../../../src/presentation/api/controllers/onboarding-instance-controller.js", () => ({
  approveOnboardingInstanceHandler: vi.fn(),
  completeEquiemReviewHandler: completeEquiemReviewMock,
  createOnboardingInstanceHandler: createOnboardingInstanceMock,
  getOnboardingByLinkHandler: getOnboardingByLinkMock,
  getOnboardingReviewDataHandler: getOnboardingReviewDataMock,
  listCompaniesHandler: listCompaniesMock,
  listOnboardingInstancesHandler: listOnboardingInstancesMock,
  rejectOnboardingInstanceHandler: vi.fn(),
  reviewOnboardingSectionHandler: vi.fn(),
  saveOnboardingProgressHandler: saveOnboardingProgressMock,
  submitOnboardingHandler: submitOnboardingMock,
}))

describe("onboarding-instance-routes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("registers public onboarding routes with onboardingAuth", async () => {
    process.env["DISABLE_ONBOARDING_AUTH"] = "false"
    const module = await import("../../../../src/presentation/api/routes/onboarding-instance-routes.js")

    expect(express.Router).toHaveBeenCalledTimes(1)
    expect(routerGetMock).toHaveBeenCalledWith("/api/companies", listCompaniesMock)

    const dashboardRoute = routerGetMock.mock.calls.find((call) => call[0] === "/api/onboarding-instances")
    const completeRoute = routerPostMock.mock.calls.find(
      (call) => call[0] === "/api/onboarding-instances/:linkToken/review/complete"
    )
    const publicGetRoute = routerGetMock.mock.calls.find((call) => call[0] === "/api/public/onboarding/:linkToken")
    const publicReviewRoute = routerGetMock.mock.calls.find(
      (call) => call[0] === "/api/public/onboarding/:linkToken/review-data"
    )
    const publicPatchRoute = routerPatchMock.mock.calls.find(
      (call) => call[0] === "/api/public/onboarding/:linkToken/progress"
    )
    const publicSubmitRoute = routerPostMock.mock.calls.find(
      (call) => call[0] === "/api/public/onboarding/:linkToken/submit"
    )

    expect(dashboardRoute?.[2]).toBe(listOnboardingInstancesMock)
    expect(completeRoute?.[2]).toBe(completeEquiemReviewMock)
    expect(publicGetRoute?.[2]).toBe(getOnboardingByLinkMock)
    expect(publicReviewRoute?.[2]).toBe(getOnboardingReviewDataMock)
    expect(publicPatchRoute?.[2]).toBe(saveOnboardingProgressMock)
    expect(publicSubmitRoute?.[2]).toBe(submitOnboardingMock)

    const onboardingAuth = publicGetRoute?.[1]
    expect(typeof onboardingAuth).toBe("function")

    const req = {} as any
    const res = {} as any
    const next = vi.fn()
    ;(onboardingAuth as Function)(req, res, next)
    expect(authMiddlewareMock).toHaveBeenCalledWith(req, res, next)

    process.env["DISABLE_ONBOARDING_AUTH"] = "true"
    const bypassNext = vi.fn()
    ;(onboardingAuth as Function)(req, res, bypassNext)
    expect(bypassNext).toHaveBeenCalledTimes(1)

    delete process.env["DISABLE_ONBOARDING_AUTH"]
    expect(module.default).toBe(routerMock)
  })
})