import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  createUser,
  findCompanyByDomain,
  findUser,
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
})
