interface EmailDraftInput {
  companyName: string
  onboardingLink: string
  selectedSections: string[]
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

export { buildOnboardingEmailDraft }
