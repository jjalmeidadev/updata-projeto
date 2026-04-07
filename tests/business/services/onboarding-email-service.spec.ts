import { beforeEach, describe, expect, it, vi } from "vitest"
import { sendOnboardingSubmissionMessageToAdmins } from "../../../src/business/services/onboarding-email-service.js"

const sendMailMock = vi.fn()
const createTransportMock = vi.fn(() => ({
  sendMail: sendMailMock,
}))

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}))

describe("onboarding-email-service", () => {
  beforeEach(() => {
    createTransportMock.mockReset()
    createTransportMock.mockReturnValue({ sendMail: sendMailMock })
    sendMailMock.mockReset()
    ;(globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {},
    }
  })

  it("returns missing configuration when SMTP settings are not provided", async () => {
    const result = await sendOnboardingSubmissionMessageToAdmins({
      companyName: "Company 1",
      onboardingLink: "http://localhost:4200/onboarding/token-1",
      selectedSections: ["company-details"],
      submittedAt: "2026-04-06T12:00:00.000Z",
    })

    expect(result).toEqual({
      sent: false,
      provider: "smtp",
      reason: "missing_or_invalid_smtp_configuration",
    })
    expect(createTransportMock).not.toHaveBeenCalled()
  })

  it("sends message to all configured admins", async () => {
    ;(globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {
        ONBOARDING_SMTP_HOST: "smtp.mail.local",
        ONBOARDING_SMTP_PORT: "587",
        ONBOARDING_SMTP_USER: "bot@mail.local",
        ONBOARDING_SMTP_PASS: "secret",
        ONBOARDING_EMAIL_FROM: "bot@mail.local",
        ONBOARDING_ADMIN_EMAIL_TO: "admin1@mail.local, admin2@mail.local",
      },
    }

    sendMailMock.mockResolvedValue({ messageId: "message-1" })

    const result = await sendOnboardingSubmissionMessageToAdmins({
      companyName: "Company 1",
      onboardingLink: "http://localhost:4200/onboarding/token-1",
      selectedSections: ["company-details", "building-setup"],
      submittedAt: "2026-04-06T12:00:00.000Z",
    })

    expect(createTransportMock).toHaveBeenCalledWith({
      host: "smtp.mail.local",
      port: 587,
      secure: false,
      auth: {
        user: "bot@mail.local",
        pass: "secret",
      },
    })
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["admin1@mail.local", "admin2@mail.local"],
        from: "bot@mail.local",
      })
    )
    expect(result).toMatchObject({
      sent: true,
      provider: "smtp",
      to: ["admin1@mail.local", "admin2@mail.local"],
      from: "bot@mail.local",
      messageId: "message-1",
    })
  })
})
