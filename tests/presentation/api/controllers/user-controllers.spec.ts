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
    it("retorna 401 quando req.auth.payload.sub está ausente", async () => {
      const req = { auth: { payload: {} }, headers: {} } as Request
      const res = mockRes()

      await getPayload(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid token payload" })
      )
      expect(checkUser).not.toHaveBeenCalled()
    })

    it("retorna 200 com next /monitoring quando email termina com @getequiem.com", async () => {
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

    it("retorna 200 com next /company/:id quando user tem company_id", async () => {
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

    it("retorna 403 quando usuário sem company_id e email não interno", async () => {
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

    it("retorna 500 quando checkUser lança", async () => {
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
  })
})
