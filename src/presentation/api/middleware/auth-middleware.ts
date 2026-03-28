import { auth } from "express-oauth2-jwt-bearer";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

// Validates incoming Bearer JWT against the configured issuer and API audience.
// Defaults are aligned with the current frontend Auth0 configuration.
export const authMiddleware = auth({
  audience: env.AUTH0_AUDIENCE || "https://api.updata.com",
  issuerBaseURL: env.AUTH0_ISSUER_BASE_URL || "https://dev-e8hme66hgt4cf75n.us.auth0.com/",
});

export default authMiddleware
