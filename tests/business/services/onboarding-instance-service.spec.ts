import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../../src/data/repositories/onboarding-instance-repository.js", () => ({
  createOnboardingInstance: vi.fn(),
  findCompanyByName: vi.fn(),
  findOnboardingInstanceByLinkToken: vi.fn(),
  findReusableOnboardingInstance: vi.fn(),
  listCompanies: vi.fn(),
  listOnboardingInstances: vi.fn(),
  updateOnboardingInstance: vi.fn(),
}))

vi.mock("../../../src/business/services/onboarding-email-service.js", () => ({
  buildOnboardingEmailDraft: vi.fn(),
  sendOnboardingSubmissionMessageToAdmins: vi.fn(),
}))

import {
  createOnboardingInstance,
  findCompanyByName,
  findOnboardingInstanceByLinkToken,
  findReusableOnboardingInstance,
  listCompanies,
  listOnboardingInstances,
  updateOnboardingInstance,
} from "../../../src/data/repositories/onboarding-instance-repository.js"
import { sendOnboardingSubmissionMessageToAdmins } from "../../../src/business/services/onboarding-email-service.js"
import {
  OnboardingAccessDeniedError,
  createOrReuseOnboardingInstance,
  getOnboardingInstanceByLinkForAuthenticatedUser,
  submitOnboarding,
} from "../../../src/business/services/onboarding-instance-service.js"

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "instance-1",
    company_id: "company-1",
    company_name: "Company 1",
    selected_sections: ["company-details"],
    allowed_emails: ["admin@company.com"],
    status: "in_progress",
    progress_percent: 55,
    link_token: "token-1",
    form_data: {},
    email_status: "pending_manual_send",
    email_payload: { provider: "manual" },
    submitted_at: null,
    reviewed_at: null,
    completed_at: null,
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("onboarding-instance-service submitOnboarding", () => {
  beforeEach(() => {
    vi.mocked(findOnboardingInstanceByLinkToken).mockReset()
    vi.mocked(updateOnboardingInstance).mockReset()
    vi.mocked(sendOnboardingSubmissionMessageToAdmins).mockReset()
  })

  it("sends admin message after submission and stores sent status", async () => {
    const initial = makeRecord()
    const afterSubmit = makeRecord({
      status: "equiem_review",
      progress_percent: 100,
      submitted_at: "2026-04-06T12:00:00.000Z",
    })
    const afterNotification = makeRecord({
      status: "equiem_review",
      progress_percent: 100,
      submitted_at: "2026-04-06T12:00:00.000Z",
      email_status: "admin_submission_message_sent",
      email_payload: {
        provider: "manual",
        adminSubmissionMessage: {
          sent: true,
          provider: "smtp",
        },
      },
    })

    vi.mocked(findOnboardingInstanceByLinkToken).mockResolvedValue(initial as never)
    vi.mocked(updateOnboardingInstance)
      .mockResolvedValueOnce(afterSubmit as never)
      .mockResolvedValueOnce(afterNotification as never)
    vi.mocked(sendOnboardingSubmissionMessageToAdmins).mockResolvedValue({
      sent: true,
      provider: "smtp",
      messageId: "message-1",
    } as never)

    const result = await submitOnboarding(
      "token-1",
      { foo: "bar" },
      "http://localhost:4200",
      "admin@company.com"
    )

    expect(sendOnboardingSubmissionMessageToAdmins).toHaveBeenCalledWith({
      companyName: "Company 1",
      onboardingLink: "http://localhost:4200/onboarding/token-1",
      selectedSections: ["company-details"],
      submittedAt: "2026-04-06T12:00:00.000Z",
    })
    expect(updateOnboardingInstance).toHaveBeenNthCalledWith(
      2,
      "instance-1",
      expect.objectContaining({
        emailStatus: "admin_submission_message_sent",
      })
    )
    expect(result).toMatchObject({
      status: "equiem_review",
      emailStatus: "admin_submission_message_sent",
    })
  })

  it("keeps submission flow even when admin message fails", async () => {
    const initial = makeRecord()
    const afterSubmit = makeRecord({
      status: "equiem_review",
      progress_percent: 100,
      submitted_at: "2026-04-06T12:00:00.000Z",
    })
    const afterNotification = makeRecord({
      status: "equiem_review",
      progress_percent: 100,
      submitted_at: "2026-04-06T12:00:00.000Z",
      email_status: "admin_submission_message_failed",
    })

    vi.mocked(findOnboardingInstanceByLinkToken).mockResolvedValue(initial as never)
    vi.mocked(updateOnboardingInstance)
      .mockResolvedValueOnce(afterSubmit as never)
      .mockResolvedValueOnce(afterNotification as never)
    vi.mocked(sendOnboardingSubmissionMessageToAdmins).mockResolvedValue({
      sent: false,
      provider: "smtp",
      reason: "missing_or_invalid_smtp_configuration",
    } as never)

    const result = await submitOnboarding(
      "token-1",
      {},
      "http://localhost:4200",
      "admin@company.com"
    )

    expect(updateOnboardingInstance).toHaveBeenNthCalledWith(
      2,
      "instance-1",
      expect.objectContaining({
        emailStatus: "admin_submission_message_failed",
      })
    )
    expect(result).toMatchObject({
      status: "equiem_review",
      emailStatus: "admin_submission_message_failed",
    })
  })
})

describe("onboarding-instance-service allowlist handling", () => {
  beforeEach(() => {
    vi.mocked(createOnboardingInstance).mockReset()
    vi.mocked(findCompanyByName).mockReset()
    vi.mocked(findReusableOnboardingInstance).mockReset()
    vi.mocked(findOnboardingInstanceByLinkToken).mockReset()
    vi.mocked(listCompanies).mockReset()
    vi.mocked(listOnboardingInstances).mockReset()
  })

  it("rejects an empty allowedEmails list", async () => {
    await expect(
      createOrReuseOnboardingInstance({
        companyName: "Acme",
        selectedSections: ["company-details"],
        allowedEmails: [],
        baseUrl: "http://localhost:4200",
      })
    ).rejects.toThrow("At least one allowed email must be provided")
  })

  it("rejects an invalid allowed email", async () => {
    await expect(
      createOrReuseOnboardingInstance({
        companyName: "Acme",
        selectedSections: ["company-details"],
        allowedEmails: ["bad-email"],
        baseUrl: "http://localhost:4200",
      })
    ).rejects.toThrow("Invalid email address: bad-email")
  })

  it("normalizes, deduplicates, and lowercases allowed emails before persistence", async () => {
    vi.mocked(findReusableOnboardingInstance).mockResolvedValue(null)
    vi.mocked(findCompanyByName).mockResolvedValue(null)
    vi.mocked(createOnboardingInstance).mockResolvedValue({
      id: "instance-1",
      company_id: null,
      batch_id: null,
      company_name: "Acme",
      selected_sections: ["company-details"],
      allowed_emails: ["alpha@example.com", "beta@example.com"],
      status: "draft",
      progress_percent: 0,
      link_token: "token-1",
      form_data: {},
      email_status: "pending_manual_send",
      email_payload: {},
      submitted_at: null,
      reviewed_at: null,
      completed_at: null,
      created_at: "2026-04-07T00:00:00.000Z",
      updated_at: "2026-04-07T00:00:00.000Z",
    } as never)

    await createOrReuseOnboardingInstance({
      companyName: "Acme",
      selectedSections: ["company-details"],
      allowedEmails: [" BETA@example.com ", "alpha@example.com", "alpha@example.com"],
      baseUrl: "http://localhost:4200",
    })

    expect(createOnboardingInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedEmails: ["alpha@example.com", "beta@example.com"],
      })
    )
  })

  it("throws 403 when the authenticated email is not in the allowlist", async () => {
    vi.mocked(findOnboardingInstanceByLinkToken).mockResolvedValue({
      id: "instance-1",
      company_id: null,
      batch_id: null,
      company_name: "Acme",
      selected_sections: ["company-details"],
      allowed_emails: ["owner@acme.com"],
      status: "draft",
      progress_percent: 0,
      link_token: "token-1",
      form_data: {},
      email_status: "pending_manual_send",
      email_payload: null,
      submitted_at: null,
      reviewed_at: null,
      completed_at: null,
      created_at: "2026-04-07T00:00:00.000Z",
      updated_at: "2026-04-07T00:00:00.000Z",
    } as never)

    await expect(
      getOnboardingInstanceByLinkForAuthenticatedUser(
        "token-1",
        "http://localhost:4200",
        "other@example.com"
      )
    ).rejects.toBeInstanceOf(OnboardingAccessDeniedError)
  })

  it("creates a new onboarding instance when allowedEmails differs from a reusable one", async () => {
    vi.mocked(findReusableOnboardingInstance).mockResolvedValue({
      id: "instance-reusable",
      company_id: null,
      batch_id: null,
      company_name: "Acme",
      selected_sections: ["company-details"],
      allowed_emails: ["old-owner@acme.com"],
      status: "draft",
      progress_percent: 0,
      link_token: "token-old",
      form_data: {},
      email_status: "pending_manual_send",
      email_payload: null,
      submitted_at: null,
      reviewed_at: null,
      completed_at: null,
      created_at: "2026-04-07T00:00:00.000Z",
      updated_at: "2026-04-07T00:00:00.000Z",
    } as never)
    vi.mocked(findCompanyByName).mockResolvedValue(null)
    vi.mocked(createOnboardingInstance).mockResolvedValue({
      id: "instance-new",
      company_id: null,
      batch_id: null,
      company_name: "Acme",
      selected_sections: ["company-details"],
      allowed_emails: ["new-owner@acme.com"],
      status: "draft",
      progress_percent: 0,
      link_token: "token-new",
      form_data: {},
      email_status: "pending_manual_send",
      email_payload: {},
      submitted_at: null,
      reviewed_at: null,
      completed_at: null,
      created_at: "2026-04-07T00:00:00.000Z",
      updated_at: "2026-04-07T00:00:00.000Z",
    } as never)

    const result = await createOrReuseOnboardingInstance({
      companyName: "Acme",
      selectedSections: ["company-details"],
      allowedEmails: ["new-owner@acme.com"],
      baseUrl: "http://localhost:4200",
    })

    expect(result.reusedExistingInstance).toBe(false)
    expect(createOnboardingInstance).toHaveBeenCalledTimes(1)
    expect(createOnboardingInstance).toHaveBeenCalledWith(
      expect.objectContaining({ allowedEmails: ["new-owner@acme.com"] })
    )
  })
})
