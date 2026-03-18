import { auth } from "express-oauth2-jwt-bearer";

// Validates incoming Bearer JWT against the configured issuer and API audience.
export const authMiddleware = auth({
  audience: "https://api.updata.com",
  issuerBaseURL: "https://dev-6imaiajbfe843lz7.us.auth0.com/"
});

export default authMiddleware