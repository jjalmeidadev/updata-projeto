import { auth } from "express-oauth2-jwt-bearer";
import type { Request, Response, NextFunction } from "express";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

// Validates incoming Bearer JWT against the configured issuer and API audience.
// Defaults are aligned with the current frontend Auth0 configuration.
const baseAuthMiddleware = auth({
  audience: env.AUTH0_AUDIENCE || "https://api.updata.com",
  issuerBaseURL: env.AUTH0_ISSUER_BASE_URL || "https://dev-e8hme66hgt4cf75n.us.auth0.com/",
});

// Wrapper to log request details before validation
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || "";
  const hasBearer = authHeader.startsWith("Bearer ");
  const tokenPreview = hasBearer ? authHeader.substring(0, 30) + "..." : "none";
  
  console.log(`[AUTH][${Date.now()}] authMiddleware called:`, {
    path: req.path,
    hasAuthorizationHeader: !!authHeader,
    hasBearerPrefix: hasBearer,
    tokenPreview,
    audience: env.AUTH0_AUDIENCE || "https://api.updata.com",
    issuerBaseURL: env.AUTH0_ISSUER_BASE_URL || "https://dev-e8hme66hgt4cf75n.us.auth0.com/",
  });

  baseAuthMiddleware(req, res, (err?: unknown) => {
    if (err) {
      console.error(`[AUTH][${Date.now()}] Token validation failed:`, {
        error: err instanceof Error ? err.message : String(err),
        tokenPreview,
      });
    } else {
      console.log(`[AUTH][${Date.now()}] Token validated successfully for:`, {
        path: req.path,
        sub: (req.auth?.payload as Record<string, unknown>)?.sub,
      });
    }
    next(err);
  });
};

export default authMiddleware
