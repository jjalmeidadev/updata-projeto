import { describe, it, expect, vi, beforeEach } from "vitest"
import * as userRepo from "../../../src/data/repositories/user-repository.js"
import { checkUser, resolveUserNavigation } from "../../../src/business/services/user-service.js"

vi.mock("../../../src/data/repositories/user-repository.js", () => ({
  findUser: vi.fn(),
  createUser: vi.fn(),
  findCompanyByDomain: vi.fn(),
}))

describe("user-service", () => {
  beforeEach(() => {
    vi.mocked(userRepo.findUser).mockReset()
    vi.mocked(userRepo.createUser).mockReset()
    vi.mocked(userRepo.findCompanyByDomain).mockReset()
  })

  describe("checkUser", () => {
    it("throws 'No payload found' when payload is undefined", async () => {
      await expect(checkUser(undefined, "trace-1")).rejects.toThrow("No payload found")
      expect(userRepo.findUser).not.toHaveBeenCalled()
    })

    it("returns existing user when findUser resolves", async () => {
      const existing = {
        user_id: 1,
        user_name: "Jane",
        user_email: "jane@co.com",
        auth0_id: "auth0|1",
        company_id: 10,
      }
      vi.mocked(userRepo.findUser).mockResolvedValue(existing)

      const result = await checkUser(
        { sub: "auth0|1", name: "Jane", email: "jane@co.com" },
        "trace-1"
      )

      expect(result).toEqual(existing)
      expect(userRepo.findUser).toHaveBeenCalledWith("auth0|1", "trace-1")
      expect(userRepo.createUser).not.toHaveBeenCalled()
    })

    it("calls createUser and returns new user when findUser returns null", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(5)
      const newUser = {
        user_id: 2,
        user_name: "John",
        user_email: "john@acme.com",
        auth0_id: "auth0|2",
        company_id: 5,
      }
      vi.mocked(userRepo.createUser).mockResolvedValue(newUser)

      const result = await checkUser(
        { sub: "auth0|2", name: "John", email: "john@acme.com" },
        "trace-1"
      )

      expect(result).toEqual(newUser)
      expect(userRepo.findCompanyByDomain).toHaveBeenCalledWith("acme.com", "trace-1")
      expect(userRepo.createUser).toHaveBeenCalledWith(
        {
          auth0_id: "auth0|2",
          name: "John",
          email: "john@acme.com",
          company_id: 5,
        },
        "trace-1"
      )
    })

    it("creates user without company_id when findCompanyByDomain returns null", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(null)
      const newUser = {
        user_id: 3,
        user_name: "Bob",
        user_email: "bob@unknown.org",
        auth0_id: "auth0|3",
        company_id: null,
      }
      vi.mocked(userRepo.createUser).mockResolvedValue(newUser)

      const result = await checkUser(
        { sub: "auth0|3", name: "Bob", email: "bob@unknown.org" },
        "trace-1"
      )

      expect(userRepo.createUser).toHaveBeenCalledWith(
        {
          auth0_id: "auth0|3",
          name: "Bob",
          email: "bob@unknown.org",
          company_id: undefined,
        },
        "trace-1"
      )
      expect(result).toEqual(newUser)
    })

    it("falls back to empty name/email when claims are missing", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(null)

      const newUser = {
        user_id: "4",
        user_name: "Unknown User",
        user_email: "",
        auth0_id: "auth0|4",
        company_id: null,
      }

      vi.mocked(userRepo.createUser).mockResolvedValue(newUser)

      const result = await checkUser({ sub: "auth0|4" }, "trace-empty")

      expect(userRepo.findCompanyByDomain).toHaveBeenCalledWith("", "trace-empty")
      expect(userRepo.createUser).toHaveBeenCalledWith(
        {
          auth0_id: "auth0|4",
          name: "",
          email: "",
          company_id: undefined,
        },
        "trace-empty"
      )
      expect(result).toEqual(newUser)
    })

    it("returns null when repository create returns null", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(null)
      vi.mocked(userRepo.createUser).mockResolvedValue(null as never)

      const result = await checkUser(
        { sub: "auth0|null-create", name: "Null", email: "null@none.com" },
        "trace-null-create"
      )

      expect(result).toBeNull()
    })
  })

  describe("resolveUserNavigation", () => {
    it("returns monitoring route for internal users", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue({
        user_id: "u-int",
        user_name: "Internal",
        user_email: "internal@getequiem.com",
        auth0_id: "auth0|internal",
        company_id: null,
      })

      const result = await resolveUserNavigation(
        { sub: "auth0|internal", email: "internal@getequiem.com" },
        "trace-nav-internal"
      )

      expect(result).toEqual({
        outcome: "monitoring",
      })
    })

    it("returns company route for mapped users", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue({
        user_id: "u-co",
        user_name: "Company User",
        user_email: "user@company.com",
        auth0_id: "auth0|company",
        company_id: "c-10",
      })

      const result = await resolveUserNavigation(
        { sub: "auth0|company", email: "user@company.com" },
        "trace-nav-company"
      )

      expect(result).toEqual({
        outcome: "company",
        companyId: "c-10",
      })
    })

    it("returns 403 when company is not mapped", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue({
        user_id: "u-no-company",
        user_name: "No Company",
        user_email: "user@unknown.com",
        auth0_id: "auth0|no-company",
        company_id: null,
      })

      const result = await resolveUserNavigation(
        { sub: "auth0|no-company", email: "user@unknown.com" },
        "trace-nav-403"
      )

      expect(result).toEqual({
        outcome: "unregistered",
      })
    })

    it("returns 404 when user cannot be resolved", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(null)
      vi.mocked(userRepo.createUser).mockResolvedValue(null as never)

      const result = await resolveUserNavigation(
        { sub: "auth0|missing", email: "missing@none.com" },
        "trace-nav-404"
      )

      expect(result).toEqual({
        outcome: "not_found",
      })
    })
  })
})
