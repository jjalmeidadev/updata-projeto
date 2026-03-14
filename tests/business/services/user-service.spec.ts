import { describe, it, expect, vi, beforeEach } from "vitest"
import * as userRepo from "../../../src/data/repositories/user-repository.js"
import { checkUser } from "../../../src/business/services/user-service.js"

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
    it("lança 'No payload found' quando payload é undefined", async () => {
      await expect(checkUser(undefined, "trace-1")).rejects.toThrow("No payload found")
      expect(userRepo.findUser).not.toHaveBeenCalled()
    })

    it("retorna usuário existente quando findUser encontra", async () => {
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

    it("chama createUser e retorna novo usuário quando findUser retorna null", async () => {
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

    it("cria usuário sem company_id quando findCompanyByDomain retorna null", async () => {
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
  })
})
