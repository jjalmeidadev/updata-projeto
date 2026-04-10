import { describe, it, expect, vi, beforeEach } from "vitest"
import * as userRepo from "../../../src/data/repositories/user-repository.js"
import { checkUser, resolveUserNavigation } from "../../../src/business/services/user-service.js"
import { INTERNAL_TEST_EMAILS } from "../../../src/shared/auth-constants.js"

vi.mock("../../../src/data/repositories/user-repository.js", () => ({
  findUser: vi.fn(),
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  findCompanyByDomain: vi.fn(),
  linkUserToAuth0ByEmail: vi.fn(),
  updateUserByAuth0Id: vi.fn(),
}))

describe("user-service", () => {
  beforeEach(() => {
    vi.mocked(userRepo.findUser).mockReset()
    vi.mocked(userRepo.findUserByEmail).mockReset()
    vi.mocked(userRepo.createUser).mockReset()
    vi.mocked(userRepo.findCompanyByDomain).mockReset()
    vi.mocked(userRepo.linkUserToAuth0ByEmail).mockReset()
    vi.mocked(userRepo.updateUserByAuth0Id).mockReset()
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
      expect(userRepo.findCompanyByDomain).not.toHaveBeenCalled()
      expect(userRepo.findUserByEmail).not.toHaveBeenCalled()
      expect(userRepo.createUser).not.toHaveBeenCalled()
      expect(userRepo.updateUserByAuth0Id).not.toHaveBeenCalled()
    })

    it("syncs existing user when token has improved email/company attributes", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue({
        user_id: "u-sync",
        user_name: "Unknown User",
        user_email: "auth0_sync@auth0.local",
        auth0_id: "auth0|sync",
        company_id: null,
      })
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue("c-sync")
      vi.mocked(userRepo.updateUserByAuth0Id).mockResolvedValue({
        user_id: "u-sync",
        user_name: "Jane",
        user_email: "jane@co.com",
        auth0_id: "auth0|sync",
        company_id: "c-sync",
      })

      const result = await checkUser(
        { sub: "auth0|sync", name: "Jane", email: "jane@co.com" },
        "trace-1"
      )

      expect(userRepo.findCompanyByDomain).toHaveBeenCalledWith("co.com", "trace-1")
      expect(userRepo.updateUserByAuth0Id).toHaveBeenCalledWith(
        {
          auth0_id: "auth0|sync",
          name: "Jane",
          email: "jane@co.com",
          company_id: "c-sync",
        },
        "trace-1"
      )
      expect(result).toEqual({
        user_id: "u-sync",
        user_name: "Jane",
        user_email: "jane@co.com",
        auth0_id: "auth0|sync",
        company_id: "c-sync",
      })
    })

    it("keeps existing user unchanged when email claim is missing", async () => {
      const existing = {
        user_id: "u-no-email",
        user_name: "No Email",
        user_email: "auth0_no_email@auth0.local",
        auth0_id: "auth0|no-email",
        company_id: null,
      }

      vi.mocked(userRepo.findUser).mockResolvedValue(existing)

      const result = await checkUser({ sub: "auth0|no-email" }, "trace-no-email")

      expect(result).toEqual(existing)
      expect(userRepo.updateUserByAuth0Id).not.toHaveBeenCalled()
      expect(userRepo.findCompanyByDomain).not.toHaveBeenCalled()
    })

    it("syncs existing user name even when email claim is missing", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue({
        user_id: "u-name-sync",
        user_name: "Unknown User",
        user_email: "google-oauth2_999@auth0.local",
        auth0_id: "google-oauth2|999",
        company_id: null,
      })
      vi.mocked(userRepo.updateUserByAuth0Id).mockResolvedValue({
        user_id: "u-name-sync",
        user_name: "Jane Realname",
        user_email: "google-oauth2_999@auth0.local",
        auth0_id: "google-oauth2|999",
        company_id: null,
      })

      const result = await checkUser(
        { sub: "google-oauth2|999", name: "Jane Realname" },
        "trace-name-sync"
      )

      expect(userRepo.findCompanyByDomain).not.toHaveBeenCalled()
      expect(userRepo.updateUserByAuth0Id).toHaveBeenCalledWith(
        {
          auth0_id: "google-oauth2|999",
          name: "Jane Realname",
          email: "google-oauth2_999@auth0.local",
          company_id: undefined,
        },
        "trace-name-sync"
      )
      expect(result).toEqual({
        user_id: "u-name-sync",
        user_name: "Jane Realname",
        user_email: "google-oauth2_999@auth0.local",
        auth0_id: "google-oauth2|999",
        company_id: null,
      })
    })

    it("calls createUser and returns new user when findUser returns null", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
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
      expect(userRepo.findUserByEmail).toHaveBeenCalledWith("john@acme.com", "trace-1")
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
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
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

    it("falls back to synthetic email when token email claim is missing", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(null)

      const newUser = {
        user_id: "4",
        user_name: "Unknown User",
        user_email: "auth0_4@auth0.local",
        auth0_id: "auth0|4",
        company_id: null,
      }

      vi.mocked(userRepo.createUser).mockResolvedValue(newUser)

      const result = await checkUser({ sub: "auth0|4" }, "trace-empty")

      expect(userRepo.findCompanyByDomain).not.toHaveBeenCalled()
      expect(userRepo.findUserByEmail).not.toHaveBeenCalled()
      expect(userRepo.createUser).toHaveBeenCalledWith(
        {
          auth0_id: "auth0|4",
          name: "",
          email: "auth0_4@auth0.local",
          company_id: undefined,
        },
        "trace-empty"
      )
      expect(result).toEqual(newUser)
    })

    it("returns null when repository create returns null", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue(null)
      vi.mocked(userRepo.createUser).mockResolvedValue(null as never)

      const result = await checkUser(
        { sub: "auth0|null-create", name: "Null", email: "null@none.com" },
        "trace-null-create"
      )

      expect(result).toBeNull()
    })

    it("links existing DB user by email instead of inserting duplicate", async () => {
      vi.mocked(userRepo.findUser).mockResolvedValue(null)
      vi.mocked(userRepo.findCompanyByDomain).mockResolvedValue("c-5")
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
        user_id: "u-existing",
        user_name: "Legacy User",
        user_email: "legacy@acme.com",
        auth0_id: "",
        company_id: null,
      })
      vi.mocked(userRepo.linkUserToAuth0ByEmail).mockResolvedValue({
        user_id: "u-existing",
        user_name: "Legacy User",
        user_email: "legacy@acme.com",
        auth0_id: "auth0|legacy",
        company_id: "c-5",
      })

      const result = await checkUser(
        { sub: "auth0|legacy", name: "Legacy User", email: "legacy@acme.com" },
        "trace-link-email"
      )

      expect(userRepo.linkUserToAuth0ByEmail).toHaveBeenCalledWith(
        {
          auth0_id: "auth0|legacy",
          name: "Legacy User",
          email: "legacy@acme.com",
          company_id: "c-5",
        },
        "trace-link-email"
      )
      expect(userRepo.createUser).not.toHaveBeenCalled()
      expect(result).toEqual({
        user_id: "u-existing",
        user_name: "Legacy User",
        user_email: "legacy@acme.com",
        auth0_id: "auth0|legacy",
        company_id: "c-5",
      })
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

    it("returns monitoring route for allowlisted admin test email", async () => {
      const adminEmail = "equiem.onboarding@gmail.com"
      INTERNAL_TEST_EMAILS.add(adminEmail)

      vi.mocked(userRepo.findUser).mockResolvedValue({
        user_id: "u-admin-test",
        user_name: "Yudi",
        user_email: adminEmail,
        auth0_id: "auth0|admin-test",
        company_id: null,
      })

      const result = await resolveUserNavigation(
        { sub: "auth0|admin-test", email: adminEmail },
        "trace-nav-admin-test"
      )

      INTERNAL_TEST_EMAILS.delete(adminEmail)

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
      vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
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
