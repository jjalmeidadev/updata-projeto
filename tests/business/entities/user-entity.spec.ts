import { describe, it, expect } from "vitest"
import { UserEntity } from "../../../src/business/entities/user-entity.js"

describe("UserEntity", () => {
  describe("getEmailDomain", () => {
    it("returns empty string when email is empty", () => {
      const entity = new UserEntity("auth0|1", "Name", "")
      expect(entity.getEmailDomain()).toBe("")
    })

    it("returns empty string when email does not contain @", () => {
      const entity = new UserEntity("auth0|1", "Name", "invalid-email")
      expect(entity.getEmailDomain()).toBe("")
    })

    it("returns lowercase domain for valid email", () => {
      const entity = new UserEntity("auth0|1", "Name", "user@COMPANY.COM")
      expect(entity.getEmailDomain()).toBe("company.com")
    })

    it("returns segment after the first @ (parts[1]) for email with multiple @", () => {
      const entity = new UserEntity("auth0|1", "Name", "a@b@example.com")
      expect(entity.getEmailDomain()).toBe("b")
    })
  })
})
