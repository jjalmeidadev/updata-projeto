import { describe, it, expect } from "vitest"
import { UserEntity } from "../../../src/business/entities/user-entity.js"

describe("UserEntity", () => {
  describe("getEmailDomain", () => {
    it("retorna string vazia quando email está vazio", () => {
      const entity = new UserEntity("auth0|1", "Name", "")
      expect(entity.getEmailDomain()).toBe("")
    })

    it("retorna string vazia quando email não contém @", () => {
      const entity = new UserEntity("auth0|1", "Name", "invalid-email")
      expect(entity.getEmailDomain()).toBe("")
    })

    it("retorna domínio em minúsculas para email válido", () => {
      const entity = new UserEntity("auth0|1", "Name", "user@COMPANY.COM")
      expect(entity.getEmailDomain()).toBe("company.com")
    })

    it("retorna parte após o primeiro @ (parts[1]) para email com múltiplos @", () => {
      const entity = new UserEntity("auth0|1", "Name", "a@b@example.com")
      expect(entity.getEmailDomain()).toBe("b")
    })
  })
})
