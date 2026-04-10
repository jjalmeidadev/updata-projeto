import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockPool } = vi.hoisted(() => ({
  mockPool: {
    query: vi.fn(),
  },
}))

vi.mock("../../../src/data/database/index-table.js", () => ({
  default: mockPool,
}))

import {
  createOnboardingInstance,
  findOnboardingInstanceByLinkToken,
  listOnboardingInstances,
} from "../../../src/data/repositories/onboarding-instance-repository.js"

describe("onboarding-instance-repository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPool.query.mockReset()
  })

  it("returns allowed_emails when listing onboarding instances", async () => {
    const row = {
      id: "instance-1",
      company_id: "company-1",
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
    }

    mockPool.query.mockResolvedValue({ rows: [row] })

    const result = await listOnboardingInstances()

    expect(result).toEqual([row])
    expect(mockPool.query.mock.calls[0][0]).toContain("allowed_emails")
  })

  it("persists allowed_emails when creating an onboarding instance", async () => {
    const row = {
      id: "instance-2",
      company_id: "company-2",
      batch_id: null,
      company_name: "Globex",
      selected_sections: ["company-details"],
      allowed_emails: ["team@globex.com"],
      status: "draft",
      progress_percent: 0,
      link_token: "token-2",
      form_data: {},
      email_status: "pending_manual_send",
      email_payload: null,
      submitted_at: null,
      reviewed_at: null,
      completed_at: null,
      created_at: "2026-04-07T00:00:00.000Z",
      updated_at: "2026-04-07T00:00:00.000Z",
    }

    mockPool.query.mockResolvedValue({ rows: [row] })

    const result = await createOnboardingInstance({
      companyId: "company-2",
      companyName: "Globex",
      selectedSections: ["company-details"],
      allowedEmails: ["team@globex.com"],
      linkToken: "token-2",
      status: "draft",
      progressPercent: 0,
      emailStatus: "pending_manual_send",
      emailPayload: {},
    })

    expect(result).toEqual(row)
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("allowed_emails"),
      [
        "company-2",
        "Globex",
        ["company-details"],
        ["team@globex.com"],
        "draft",
        0,
        "token-2",
        "pending_manual_send",
        "{}",
      ]
    )
  })

  it("returns allowed_emails when finding an instance by link token", async () => {
    const row = {
      id: "instance-3",
      company_id: "company-3",
      batch_id: null,
      company_name: "Initech",
      selected_sections: ["company-details"],
      allowed_emails: ["admin@initech.com"],
      status: "draft",
      progress_percent: 0,
      link_token: "token-3",
      form_data: {},
      email_status: "pending_manual_send",
      email_payload: null,
      submitted_at: null,
      reviewed_at: null,
      completed_at: null,
      created_at: "2026-04-07T00:00:00.000Z",
      updated_at: "2026-04-07T00:00:00.000Z",
    }

    mockPool.query.mockResolvedValue({ rows: [row] })

    const result = await findOnboardingInstanceByLinkToken("token-3")

    expect(result).toEqual(row)
    expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining("allowed_emails"), ["token-3"])
  })
})