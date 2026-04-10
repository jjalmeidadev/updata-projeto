interface EmailDraftInput {
  companyName: string
  onboardingLink: string
  selectedSections: string[]
}

interface AdminSubmissionMessageInput {
  companyName: string
  reviewLink: string
  selectedSections: string[]
  submittedAt: string
}

interface AdminSubmissionMessageResult {
  sent: boolean
  provider: string
  to?: string[]
  from?: string
  messageId?: string
  accepted?: string[]
  rejected?: string[]
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

interface SmtpSendInput {
  to: string[]
  subject: string
  text: string
  html: string
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

  if (!host || !rawPort || !from) {
    return null
  }

  const port = Number(rawPort)

  if (!Number.isFinite(port) || port <= 0) {
    return null
  }

  const user = readEnv("ONBOARDING_SMTP_USER")?.trim()
  const passRaw = readEnv("ONBOARDING_SMTP_PASS")?.trim()
  // Gmail app passwords are frequently pasted with spaces every 4 chars.
  const pass = passRaw ? passRaw.replace(/\s+/g, "") : undefined

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
  const companyName = String(input.companyName || "Unknown company").trim() || "Unknown company"
  const selectedSections = Array.isArray(input.selectedSections)
    ? input.selectedSections.map((section) => String(section).trim()).filter(Boolean)
    : []
  const submittedAt = String(input.submittedAt || new Date().toISOString())
  const reviewLink = String(input.reviewLink || "")
  const sectionList = selectedSections.length > 0 ? selectedSections.join(", ") : "No sections selected"

  const subject = `[Onboarding] Form submitted by ${companyName}`
  const text = [
    `A user finished the onboarding form for ${companyName}.`,
    `Submitted at: ${submittedAt}`,
    `Selected sections: ${sectionList}`,
    `Review onboarding: ${reviewLink || "N/A"}`,
  ].join("\n")

  const html = buildEmailTemplate({
    title: "Onboarding submitted for review",
    eyebrow: "Equiem Notification",
    intro: "A user finished the onboarding form and it is ready for admin review.",
    details: [
      { label: "Company", value: companyName },
      { label: "Submitted at", value: submittedAt },
      { label: "Selected sections", value: sectionList },
    ],
    ctaLabel: "Review onboarding",
    ctaUrl: reviewLink,
  })

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

async function sendSmtpMessage(config: SmtpNotificationConfig, input: SmtpSendInput): Promise<{
  messageId: string
  accepted: string[]
  rejected: string[]
}> {
  const nodemailerModule = await import("nodemailer")
  const nodemailer = nodemailerModule?.default ?? nodemailerModule

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

  const info = await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  })

  return {
    messageId: info.messageId,
    accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [],
    rejected: Array.isArray(info.rejected) ? info.rejected.map(String) : [],
  }
}

async function sendOnboardingSubmissionMessageToAdmins(
  input: AdminSubmissionMessageInput
): Promise<AdminSubmissionMessageResult> {
  const config = getSmtpNotificationConfig()

  if (!config || config.adminRecipients.length === 0) {
    return {
      sent: false,
      provider: "smtp",
      reason: "missing_or_invalid_smtp_configuration",
    }
  }

  try {
    const message = buildAdminSubmissionMessage(input)

    const info = await sendSmtpMessage(config, {
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
      accepted: info.accepted,
      rejected: info.rejected,
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

interface OnboardingInviteInput {
  companyName: string
  onboardingLink: string
  selectedSections: string[]
  allowedEmails: string[]
}

interface OnboardingInviteResult {
  sent: boolean
  provider: string
  to: string[]
  from?: string
  accepted?: string[]
  rejected?: string[]
  messageId?: string
  equiemNotification?: {
    sent: boolean
    to: string[]
    accepted?: string[]
    rejected?: string[]
    messageId?: string
    reason?: string
    error?: string
  }
  reason?: string
  error?: string
  sentAt?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildEmailTemplate(input: {
  title: string
  eyebrow?: string
  intro: string
  details: Array<{ label: string; value: string }>
  ctaLabel: string
  ctaUrl: string
  footerNote?: string
}): string {
  const detailsHtml = input.details
    .map(
      (detail) =>
        `<tr><td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;width:140px;vertical-align:top;">${escapeHtml(
          detail.label
        )}</td><td style="padding:8px 0;color:#334155;font-size:14px;">${escapeHtml(detail.value)}</td></tr>`
    )
    .join("")

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fb;padding:24px 12px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">',
    '<tr><td style="background:#6d28d9;padding:20px 24px;">',
    `<p style="margin:0;color:#ffffff;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(
      input.eyebrow || "Equiem Onboarding"
    )}</p>`,
    `<h1 style="margin:8px 0 0 0;color:#ffffff;font-size:24px;line-height:1.3;">${escapeHtml(input.title)}</h1>`,
    '</td></tr>',
    '<tr><td style="padding:24px;">',
    `<p style="margin:0 0 16px 0;color:#1e293b;font-size:15px;line-height:1.6;">${escapeHtml(input.intro)}</p>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px 0;">',
    detailsHtml,
    '</table>',
    '<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">',
    `<tr><td style="border-radius:8px;background:#6d28d9;"><a href="${input.ctaUrl}" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(
      input.ctaLabel
    )}</a></td></tr>`,
    '</table>',
    `<p style="margin:0 0 10px 0;color:#64748b;font-size:12px;word-break:break-all;">If the button does not work, copy and paste this URL in your browser: ${escapeHtml(
      input.ctaUrl
    )}</p>`,
    input.footerNote
      ? `<p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">${escapeHtml(input.footerNote)}</p>`
      : "",
    '</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join("")
}

function buildOnboardingInviteMessage(input: OnboardingInviteInput): {
  subject: string
  text: string
  html: string
} {
  const sectionList = input.selectedSections.length > 0 ? input.selectedSections.join(", ") : "No sections selected"

  const subject = `Equiem onboarding link for ${input.companyName}`
  const text = [
    `Hello,`,
    ``,
    `You were invited to fill the onboarding form for ${input.companyName}.`,
    `Selected sections: ${sectionList}`,
    ``,
    `Open onboarding: ${input.onboardingLink}`,
  ].join("\n")

  const html = buildEmailTemplate({
    title: "Your onboarding form is ready",
    eyebrow: "Client Invitation",
    intro: `You were invited to fill the onboarding form for ${input.companyName}.`,
    details: [
      { label: "Company", value: input.companyName },
      { label: "Selected sections", value: sectionList },
    ],
    ctaLabel: "Open onboarding form",
    ctaUrl: input.onboardingLink,
    footerNote: "If you have any questions, reply to this email and the Equiem team will help you.",
  })

  return {
    subject,
    text,
    html,
  }
}

function buildEquiemOnboardingLinkMessage(input: OnboardingInviteInput): {
  subject: string
  text: string
  html: string
} {
  const sectionList = input.selectedSections.length > 0 ? input.selectedSections.join(", ") : "No sections selected"
  const clientRecipients = input.allowedEmails.join(", ")
  const subject = `[Onboarding] Link generated for ${input.companyName}`
  const text = [
    `A new onboarding link was generated for ${input.companyName}.`,
    `Client recipients: ${clientRecipients}`,
    `Selected sections: ${sectionList}`,
    `Open onboarding: ${input.onboardingLink}`,
  ].join("\n")

  const html = buildEmailTemplate({
    title: "New onboarding link generated",
    eyebrow: "Equiem Notification",
    intro: `A new onboarding link was generated for ${input.companyName}.`,
    details: [
      { label: "Company", value: input.companyName },
      { label: "Client recipients", value: clientRecipients },
      { label: "Selected sections", value: sectionList },
    ],
    ctaLabel: "Open onboarding",
    ctaUrl: input.onboardingLink,
  })

  return {
    subject,
    text,
    html,
  }
}

async function sendOnboardingInviteToAllowedEmails(
  input: OnboardingInviteInput
): Promise<OnboardingInviteResult> {
  const config = getSmtpNotificationConfig()

  if (!config) {
    return {
      sent: false,
      provider: "smtp",
      to: input.allowedEmails,
      reason: "missing_or_invalid_smtp_configuration",
    }
  }

  const message = buildOnboardingInviteMessage(input)
  const equiemMessage = buildEquiemOnboardingLinkMessage(input)

  try {
    const inviteInfo = await sendSmtpMessage(config, {
      to: input.allowedEmails,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })

    let equiemNotification: OnboardingInviteResult["equiemNotification"]

    if (config.adminRecipients.length > 0) {
      try {
        const equiemInfo = await sendSmtpMessage(config, {
          to: config.adminRecipients,
          subject: equiemMessage.subject,
          text: equiemMessage.text,
          html: equiemMessage.html,
        })

        equiemNotification = {
          sent: true,
          to: config.adminRecipients,
          accepted: equiemInfo.accepted,
          rejected: equiemInfo.rejected,
          messageId: equiemInfo.messageId,
        }
      } catch (error) {
        equiemNotification = {
          sent: false,
          to: config.adminRecipients,
          reason: "smtp_send_failed",
          error: error instanceof Error ? error.message : "unknown_error",
        }
      }
    }

    return {
      sent: true,
      provider: "smtp",
      to: input.allowedEmails,
      from: config.from,
      accepted: inviteInfo.accepted,
      rejected: inviteInfo.rejected,
      messageId: inviteInfo.messageId,
      equiemNotification,
      sentAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      sent: false,
      provider: "smtp",
      to: input.allowedEmails,
      from: config.from,
      reason: "smtp_send_failed",
      error: error instanceof Error ? error.message : "unknown_error",
    }
  }
}

export { buildOnboardingEmailDraft, sendOnboardingSubmissionMessageToAdmins, sendOnboardingInviteToAllowedEmails }
