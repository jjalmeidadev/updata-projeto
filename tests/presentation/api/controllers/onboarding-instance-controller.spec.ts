import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Request, Response } from "express"

const serviceMocks = vi.hoisted(() => ({
  createOrReuseOnboardingInstance: vi.fn(),
  getOnboardingInstanceByLinkForAuthenticatedUser: vi.fn(),
}))

const userRepositoryMocks = vi.hoisted(() => ({
  findUser: vi.fn(),
}))

vi.mock("../../../../src/business/services/onboarding-instance-service.js", () => ({
  createOrReuseOnboardingInstance: serviceMocks.createOrReuseOnboardingInstance,
  getOnboardingInstanceByLinkForAuthenticatedUser:
    serviceMocks.getOnboardingInstanceByLinkForAuthenticatedUser,
}))

vi.mock("../../../../src/data/repositories/user-repository.js", () => ({
  findUser: userRepositoryMocks.findUser,
}))

import {
  createOnboardingInstanceHandler,
  getOnboardingByLinkHandler,
} from "../../../../src/presentation/api/controllers/onboarding-instance-controller.js"

function mockRes(): Response {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

function mockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    headers: {},
    protocol: "http",
    get: vi.fn(() => "localhost:4200"),
    ...overrides,
  } as unknown as Request
}

describe("onboarding-instance-controller", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviceMocks.createOrReuseOnboardingInstance.mockReset()
    serviceMocks.getOnboardingInstanceByLinkForAuthenticatedUser.mockReset()
    userRepositoryMocks.findUser.mockReset()
  })

  it("passes allowedEmails to createOrReuseOnboardingInstance", async () => {
    serviceMocks.createOrReuseOnboardingInstance.mockResolvedValue({
      instance: {
        linkUrl: "http://localhost:4200/onboarding/token-1",
      },
      reusedExistingInstance: false,
      reuseRule: "rule",
    })

    const req = mockReq({
      body: {
        companyName: "Acme",
        selectedSections: ["company-details"],
        allowedEmails: ["owner@acme.com"],
      },
    })
    const res = mockRes()

    await createOnboardingInstanceHandler(req, res)

    expect(serviceMocks.createOrReuseOnboardingInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: "Acme",
        selectedSections: ["company-details"],
        allowedEmails: ["owner@acme.com"],
      })
    )
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it("returns 403 when the public onboarding link is not allowed for the authenticated email", async () => {
    serviceMocks.getOnboardingInstanceByLinkForAuthenticatedUser.mockRejectedValue(
      Object.assign(new Error("You are not allowed to access this onboarding link"), {
        name: "OnboardingAccessDeniedError",
      })
    )

    const req = mockReq({
      params: { linkToken: "token-1" },
      auth: { payload: { email: "blocked@example.com" } },
    })
    const res = mockRes()

    await getOnboardingByLinkHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "You are not allowed to access this onboarding link" })
    )
  })

  it("falls back to DB email via sub when token has no email claim", async () => {
    userRepositoryMocks.findUser.mockResolvedValue({
      user_email: "stored.user@example.com",
    })
    serviceMocks.getOnboardingInstanceByLinkForAuthenticatedUser.mockResolvedValue({
      id: "instance-1",
      linkToken: "token-1",
      linkUrl: "http://localhost:4200/onboarding/token-1",
    })

    const req = mockReq({
      params: { linkToken: "token-1" },
      auth: { payload: { sub: "auth0|abc" } },
    })
    const res = mockRes()

    await getOnboardingByLinkHandler(req, res)

    expect(userRepositoryMocks.findUser).toHaveBeenCalledWith("auth0|abc", "onboarding-link-auth")
    expect(serviceMocks.getOnboardingInstanceByLinkForAuthenticatedUser).toHaveBeenCalledWith(
      "token-1",
      "http://localhost:4200",
      "stored.user@example.com"
    )
    expect(res.status).toHaveBeenCalledWith(200)
  })
})