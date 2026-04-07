interface EmailDraftInput {
  companyName: string
  onboardingLink: string
  selectedSections: string[]
}

interface AdminSubmissionMessageInput {
  companyName: string
  onboardingLink: string
  selectedSections: string[]
  submittedAt: string
}

interface AdminSubmissionMessageResult {
  sent: boolean
  provider: string
  to?: string[]
  from?: string
  messageId?: string
  reason?: string
  error?: string
  sentAt?: string
}

interface SmtpNotificationConfig {
  host: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  from: string
  adminRecipients: string[]
}

function readEnv(name: string): string | undefined {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name]
}

function parseCsvEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
}

function getSmtpNotificationConfig(): SmtpNotificationConfig | null {
  const host = readEnv("ONBOARDING_SMTP_HOST")?.trim()
  const rawPort = readEnv("ONBOARDING_SMTP_PORT")?.trim()
  const from = readEnv("ONBOARDING_EMAIL_FROM")?.trim() || readEnv("ONBOARDING_SMTP_USER")?.trim()
  const recipientsRaw = readEnv("ONBOARDING_ADMIN_EMAIL_TO")?.trim() || ""
  const adminRecipients = parseCsvEmails(recipientsRaw)

  if (!host || !rawPort || !from || adminRecipients.length === 0) {
    return null
  }

  const port = Number(rawPort)

  if (!Number.isFinite(port) || port <= 0) {
    return null
  }

  const user = readEnv("ONBOARDING_SMTP_USER")?.trim()
  const pass = readEnv("ONBOARDING_SMTP_PASS")?.trim()

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
    adminRecipients,
  }
}

function buildAdminSubmissionMessage(input: AdminSubmissionMessageInput): {
  subject: string
  text: string
  html: string
} {
  const sectionList = input.selectedSections.length > 0 ? input.selectedSections.join(", ") : "No sections selected"

  const subject = `[Onboarding] Form submitted by ${input.companyName}`
  const text = [
    `A user finished the onboarding form for ${input.companyName}.`,
    `Submitted at: ${input.submittedAt}`,
    `Selected sections: ${sectionList}`,
    `Open onboarding: ${input.onboardingLink}`,
  ].join("\n")

  const html = [
    "<p>A user finished the onboarding form and it is ready for admin review.</p>",
    `<p><strong>Company:</strong> ${input.companyName}</p>`,
    `<p><strong>Submitted at:</strong> ${input.submittedAt}</p>`,
    `<p><strong>Selected sections:</strong> ${sectionList}</p>`,
    `<p><a href=\"${input.onboardingLink}\">Open onboarding</a></p>`,
  ].join("")

  return {
    subject,
    text,
    html,
  }
}

function buildOnboardingEmailDraft(input: EmailDraftInput): Record<string, unknown> {
  return {
    provider: "manual",
    templateKey: "onboarding-link-share",
    subject: `Equiem onboarding for ${input.companyName}`,
    bodyPreview: `Share this onboarding link with ${input.companyName}: ${input.onboardingLink}`,
    onboardingLink: input.onboardingLink,
    selectedSections: input.selectedSections,
    manualSendRequired: true,
  }
}

async function sendOnboardingSubmissionMessageToAdmins(
  input: AdminSubmissionMessageInput
): Promise<AdminSubmissionMessageResult> {
  const config = getSmtpNotificationConfig()

  if (!config) {
    return {
      sent: false,
      provider: "smtp",
      reason: "missing_or_invalid_smtp_configuration",
    }
  }

  const { default: nodemailer } = await import("nodemailer")
  const message = buildAdminSubmissionMessage(input)
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? {
            user: config.user,
            pass: config.pass,
          }
        : undefined,
  })

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: config.adminRecipients,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })

    return {
      sent: true,
      provider: "smtp",
      to: config.adminRecipients,
      from: config.from,
      messageId: info.messageId,
      sentAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      sent: false,
      provider: "smtp",
      to: config.adminRecipients,
      from: config.from,
      reason: "smtp_send_failed",
      error: error instanceof Error ? error.message : "unknown_error",
    }
  }
}

export { buildOnboardingEmailDraft, sendOnboardingSubmissionMessageToAdmins }
