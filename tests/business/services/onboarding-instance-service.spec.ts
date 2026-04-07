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
  findOnboardingInstanceByLinkToken,
  updateOnboardingInstance,
} from "../../../src/data/repositories/onboarding-instance-repository.js"
import { sendOnboardingSubmissionMessageToAdmins } from "../../../src/business/services/onboarding-email-service.js"
import { submitOnboarding } from "../../../src/business/services/onboarding-instance-service.js"

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "instance-1",
    company_id: "company-1",
    company_name: "Company 1",
    selected_sections: ["company-details"],
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

    const result = await submitOnboarding("token-1", { foo: "bar" }, "http://localhost:4200")

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

    const result = await submitOnboarding("token-1", {}, "http://localhost:4200")

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
