import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  createUser,
  findCompanyByDomain,
  findUserByEmail,
  findUser,
  linkUserToAuth0ByEmail,
  updateUserByAuth0Id,
} from "../../../src/data/repositories/user-repository.js"

const { mockPool } = vi.hoisted(() => ({
  mockPool: {
    query: vi.fn(),
  },
}))

vi.mock("../../../src/data/database/index-table.js", () => ({
  default: mockPool,
}))

describe("user-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPool.query.mockReset()
  })

  describe("findUser", () => {
    it("returns null when no user exists for auth0 id", async () => {
      mockPool.query.mockResolvedValue({ rows: [] })

      const result = await findUser("auth0|missing", "trace-find-none")

      expect(result).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM equiem.\"user\""),
        ["auth0|missing"]
      )
    })

    it("returns mapped user record when found", async () => {
      const row = {
        user_id: "u-1",
        user_name: "Jane Doe",
        user_email: "jane@acme.com",
        auth0_id: "auth0|1",
        company_id: "c-10",
      }

      mockPool.query.mockResolvedValue({ rows: [row] })

      const result = await findUser("auth0|1", "trace-find-one")

      expect(result).toEqual(row)
    })
  })

  describe("findUserByEmail", () => {
    it("returns null when no user exists for email", async () => {
      mockPool.query.mockResolvedValue({ rows: [] })

      const result = await findUserByEmail("missing@acme.com", "trace-find-email-none")

      expect(result).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE LOWER(email) = LOWER($1)"),
        ["missing@acme.com"]
      )
    })

    it("returns mapped user record when email exists", async () => {
      const row = {
        user_id: "u-mail-1",
        user_name: "By Email",
        user_email: "user@acme.com",
        auth0_id: null,
        company_id: "c-33",
      }

      mockPool.query.mockResolvedValue({ rows: [row] })

      const result = await findUserByEmail("user@acme.com", "trace-find-email-one")

      expect(result).toEqual(row)
    })
  })

  describe("findCompanyByDomain", () => {
    it("returns null when no company matches domain", async () => {
      mockPool.query.mockResolvedValue({ rows: [] })

      const result = await findCompanyByDomain("unknown.org", "trace-domain-none")

      expect(result).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("unnest(approved_domains)"),
        ["unknown.org"]
      )
    })

    it("returns company id when domain exists", async () => {
      mockPool.query.mockResolvedValue({ rows: [{ company_id: "c-22" }] })

      const result = await findCompanyByDomain("acme.com", "trace-domain-one")

      expect(result).toBe("c-22")
    })

    it("handles empty domain input safely", async () => {
      mockPool.query.mockResolvedValue({ rows: [] })

      const result = await findCompanyByDomain("", "trace-domain-empty")

      expect(result).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [""])
    })
  })

  describe("createUser", () => {
    it("uses Unknown User when name is empty", async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          {
            user_id: "u-empty",
            user_name: "Unknown User",
            user_email: "",
            auth0_id: "auth0|empty",
            company_id: null,
          },
        ],
      })

      await createUser(
        {
          auth0_id: "auth0|empty",
          name: "   ",
          email: "",
        },
        "trace-create-empty"
      )

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
        "Unknown",
        "User",
        "",
        "auth0|empty",
        null,
      ])
    })

    it("uses User as last name when only one token is provided", async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          {
            user_id: "u-single",
            user_name: "Plato User",
            user_email: "plato@academy.org",
            auth0_id: "auth0|single",
            company_id: null,
          },
        ],
      })

      await createUser(
        {
          auth0_id: "auth0|single",
          name: "Plato",
          email: "plato@academy.org",
        },
        "trace-create-single"
      )

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
        "Plato",
        "User",
        "plato@academy.org",
        "auth0|single",
        null,
      ])
    })

    it("splits first and remaining parts for multi-token names", async () => {
      const created = {
        user_id: "u-full",
        user_name: "Jane Mary Doe",
        user_email: "jane@acme.com",
        auth0_id: "auth0|full",
        company_id: "c-1",
      }

      mockPool.query.mockResolvedValue({ rows: [created] })

      const result = await createUser(
        {
          auth0_id: "auth0|full",
          name: "Jane Mary Doe",
          email: "jane@acme.com",
          company_id: "c-1",
        },
        "trace-create-full"
      )

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
        "Jane",
        "Mary Doe",
        "jane@acme.com",
        "auth0|full",
        "c-1",
      ])
      expect(result).toEqual(created)
    })

    it("returns first row even when database omits user_id", async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          {
            user_name: "Nameless",
            user_email: "nameless@acme.com",
            auth0_id: "auth0|no-id",
            company_id: null,
          },
        ],
      })

      const result = await createUser(
        {
          auth0_id: "auth0|no-id",
          name: "Nameless",
          email: "nameless@acme.com",
        },
        "trace-create-no-id"
      )

      expect(result).toEqual({
        user_name: "Nameless",
        user_email: "nameless@acme.com",
        auth0_id: "auth0|no-id",
        company_id: null,
      })
    })
  })

  describe("linkUserToAuth0ByEmail", () => {
    it("returns null when no email-matched row is updated", async () => {
      mockPool.query.mockResolvedValue({ rows: [] })

      const result = await linkUserToAuth0ByEmail(
        {
          auth0_id: "auth0|none",
          name: "No Match",
          email: "nomatch@acme.com",
        },
        "trace-link-none"
      )

      expect(result).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE equiem.\"user\""),
        ["auth0|none", "No", "Match", null, "nomatch@acme.com"]
      )
    })

    it("updates auth0_id on existing email row and returns updated user", async () => {
      const updated = {
        user_id: "u-link-1",
        user_name: "Legacy User",
        user_email: "legacy@acme.com",
        auth0_id: "auth0|linked",
        company_id: "c-7",
      }

      mockPool.query.mockResolvedValue({ rows: [updated] })

      const result = await linkUserToAuth0ByEmail(
        {
          auth0_id: "auth0|linked",
          name: "Legacy User",
          email: "legacy@acme.com",
          company_id: "c-7",
        },
        "trace-link-one"
      )

      expect(result).toEqual(updated)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE LOWER(email) = LOWER($5)"),
        ["auth0|linked", "Legacy", "User", "c-7", "legacy@acme.com"]
      )
    })

    it("keeps existing names when incoming token name is empty", async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          {
            user_id: "u-keep-name",
            user_name: "Existing Name",
            user_email: "existing@acme.com",
            auth0_id: "auth0|keep",
            company_id: null,
          },
        ],
      })

      await linkUserToAuth0ByEmail(
        {
          auth0_id: "auth0|keep",
          name: "",
          email: "existing@acme.com",
        },
        "trace-link-keep-name"
      )

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHEN $2 = 'Unknown' AND $3 = 'User'"),
        ["auth0|keep", "Unknown", "User", null, "existing@acme.com"]
      )
    })
  })

  describe("updateUserByAuth0Id", () => {
    it("returns null when auth0 row is not found", async () => {
      mockPool.query.mockResolvedValue({ rows: [] })

      const result = await updateUserByAuth0Id(
        {
          auth0_id: "auth0|missing",
          name: "Missing User",
          email: "missing@acme.com",
        },
        "trace-update-none"
      )

      expect(result).toBeNull()
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE auth0_id = $1"),
        ["auth0|missing", "missing@acme.com", "Missing", "User", null]
      )
    })

    it("updates existing auth0 row and returns refreshed user", async () => {
      const updated = {
        user_id: "u-sync",
        user_name: "Jane Doe",
        user_email: "jane@co.com",
        auth0_id: "auth0|sync",
        company_id: "c-3",
      }

      mockPool.query.mockResolvedValue({ rows: [updated] })

      const result = await updateUserByAuth0Id(
        {
          auth0_id: "auth0|sync",
          name: "Jane Doe",
          email: "jane@co.com",
          company_id: "c-3",
        },
        "trace-update-one"
      )

      expect(result).toEqual(updated)
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("SET"),
        ["auth0|sync", "jane@co.com", "Jane", "Doe", "c-3"]
      )
    })

    it("does not overwrite existing names with Unknown/User fallback", async () => {
      mockPool.query.mockResolvedValue({
        rows: [
          {
            user_id: "u-preserve",
            user_name: "Stored Name",
            user_email: "stored@co.com",
            auth0_id: "auth0|preserve",
            company_id: null,
          },
        ],
      })

      await updateUserByAuth0Id(
        {
          auth0_id: "auth0|preserve",
          name: "",
          email: "stored@co.com",
        },
        "trace-update-preserve"
      )

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("WHEN $3 = 'Unknown' AND $4 = 'User'"),
        ["auth0|preserve", "stored@co.com", "Unknown", "User", null]
      )
    })
  })
})
