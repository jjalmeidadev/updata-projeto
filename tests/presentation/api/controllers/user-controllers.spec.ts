import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response } from "express"
import { getPayload } from "../../../../src/presentation/api/controllers/user-controllers.js"

vi.mock("../../../../src/business/services/user-service.js", () => ({
  checkUser: vi.fn(),
}))

import { checkUser } from "../../../../src/business/services/user-service.js"

function mockRes(): Response {
  const res = {} as Response
  res.setHeader = vi.fn().mockReturnValue(res)
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe("user-controllers", () => {
  beforeEach(() => {
    vi.mocked(checkUser).mockReset()
  })

  describe("getPayload", () => {
    it("returns 401 when req.auth is missing", async () => {
      const req = { headers: {} } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid token payload" })
      )
      expect(checkUser).not.toHaveBeenCalled()
    })

    it("returns 401 when req.auth.payload.sub is missing", async () => {
      const req = { auth: { payload: {} }, headers: {} } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid token payload" })
      )
      expect(checkUser).not.toHaveBeenCalled()
    })

    it("returns 200 with next /monitoring when email ends with @getequiem.com", async () => {
      vi.mocked(checkUser).mockResolvedValue({
        user_id: 1,
        user_name: "Internal",
        user_email: "dev@getequiem.com",
        auth0_id: "auth0|1",
        company_id: null,
      })

      const req = {
        auth: { payload: { sub: "auth0|1", name: "Internal", email: "dev@getequiem.com" } },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ next: "/monitoring" })
      )
    })

    it("returns 200 with next /company/:id when user has company_id", async () => {
      vi.mocked(checkUser).mockResolvedValue({
        user_id: 2,
        user_name: "Customer",
        user_email: "c@customer.com",
        auth0_id: "auth0|2",
        company_id: 42,
      })

      const req = {
        auth: { payload: { sub: "auth0|2", email: "c@customer.com" } },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ next: "/company/42" })
      )
    })

    it("returns 403 when user has no company_id and is not internal", async () => {
      vi.mocked(checkUser).mockResolvedValue({
        user_id: 3,
        user_name: "Unknown",
        user_email: "u@unknown.com",
        auth0_id: "auth0|3",
        company_id: null,
      })

      const req = {
        auth: { payload: { sub: "auth0|3", email: "u@unknown.com" } },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Company not registered" })
      )
    })

    it("returns 404 when checkUser returns null", async () => {
      vi.mocked(checkUser).mockResolvedValue(null as never)

      const req = {
        auth: { payload: { sub: "auth0|404", email: "missing@company.com" } },
        headers: { "x-debug-trace-id": "trace-404" },
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(checkUser).toHaveBeenCalledWith(
        { sub: "auth0|404", name: undefined, email: "missing@company.com" },
        "trace-404"
      )
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "User not found", traceId: "trace-404" })
      )
    })

    it("normalizes non-string claims before calling checkUser", async () => {
      vi.mocked(checkUser).mockResolvedValue({
        user_id: 4,
        user_name: "Customer",
        user_email: "customer@company.com",
        auth0_id: "auth0|4",
        company_id: 10,
      })

      const req = {
        auth: {
          payload: {
            sub: "auth0|4",
            name: 123,
            email: { value: "not-valid" },
          },
        },
        headers: { "x-debug-trace-id": "trace-claims" },
      } as unknown as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(checkUser).toHaveBeenCalledWith(
        { sub: "auth0|4", name: undefined, email: undefined },
        "trace-claims"
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ next: "/company/10", traceId: "trace-claims" })
      )
    })

    it("generates default traceId and propagates it to response and service", async () => {
      const nowSpy = vi.spyOn(Date, "now").mockReturnValue(123456)

      vi.mocked(checkUser).mockResolvedValue({
        user_id: 5,
        user_name: "DefaultTrace",
        user_email: "trace@getequiem.com",
        auth0_id: "auth0|5",
        company_id: null,
      })

      const req = {
        auth: { payload: { sub: "auth0|5", email: "trace@getequiem.com" } },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.setHeader).toHaveBeenCalledWith("x-debug-trace-id", "server-123456")
      expect(checkUser).toHaveBeenCalledWith(
        { sub: "auth0|5", name: undefined, email: "trace@getequiem.com" },
        "server-123456"
      )

      nowSpy.mockRestore()
    })

    it("returns 500 when checkUser throws", async () => {
      vi.mocked(checkUser).mockRejectedValue(new Error("DB error"))

      const req = {
        auth: { payload: { sub: "auth0|1", email: "a@b.com" } },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Error processing user" })
      )
    })

    it("returns 401 when req.auth.payload is null", async () => {
      const req = { auth: { payload: null }, headers: {} } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid token payload" })
      )
      expect(checkUser).not.toHaveBeenCalled()
    })

    it("handles empty string email by treating it as undefined", async () => {
      vi.mocked(checkUser).mockResolvedValue({
        user_id: 6,
        user_name: "EmptyEmail",
        user_email: "",
        auth0_id: "auth0|6",
        company_id: 1,
      })

      const req = {
        auth: { payload: { sub: "auth0|6", email: "" } },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      // Empty string should be treated as undefined 
      expect(checkUser).toHaveBeenCalledWith(
        { sub: "auth0|6", name: undefined, email: "" },
        expect.any(String)
      )
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it("sanitizes XSS content in string claims by validating types only", async () => {
      vi.mocked(checkUser).mockResolvedValue({
        user_id: 7,
        user_name: "Customer",
        user_email: "clean@company.com",
        auth0_id: "auth0|7",
        company_id: 5,
      })

      const req = {
        auth: {
          payload: {
            sub: "auth0|7",
            name: "<script>alert('xss')</script>",
            email: "clean@company.com",
          },
        },
        headers: {},
      } as Request
      const res = mockRes()

      await getPayload(req, res)

      // Name claim is a string, so it passes the typeof check 
      expect(checkUser).toHaveBeenCalledWith(
        {
          sub: "auth0|7",
          name: "<script>alert('xss')</script>",
          email: "clean@company.com",
        },
        expect.any(String)
      )
    })
  })
})
