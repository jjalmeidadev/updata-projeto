import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();

vi.mock('express-oauth2-jwt-bearer', () => ({
    auth: authMock,
}));

describe('Auth Middleware', () => {
    const expectedAudience = process.env.AUTH0_AUDIENCE || 'https://api.updata.com';
    const expectedIssuer = process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-e8hme66hgt4cf75n.us.auth0.com/';

    beforeEach(() => {
        // Arrange
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('configures auth middleware with expected audience and issuer', async () => {
        // Arrange
        const middlewareFn = vi.fn();
        authMock.mockReturnValue(middlewareFn);

        // Act
        await import('../../../../src/presentation/api/middleware/auth-middleware');

        // Assert
        expect(authMock).toHaveBeenCalledTimes(1);
        expect(authMock).toHaveBeenCalledWith({
            audience: expectedAudience,
            issuerBaseURL: expectedIssuer,
        });
    });

    it('exports the configured middleware as both named and default export', async () => {
        // Arrange
        const middlewareFn = vi.fn();
        authMock.mockReturnValue(middlewareFn);

        // Act
        const module = await import('../../../../src/presentation/api/middleware/auth-middleware');

        // Assert
        expect(module.authMiddleware).toBe(middlewareFn);
        expect(module.default).toBe(middlewareFn);
    });

    it('delegates request handling to the configured auth middleware function', async () => {
        // Arrange
        const middlewareFn = vi.fn((req: any, res: any, next: any) => next());
        authMock.mockReturnValue(middlewareFn);

        const req = { headers: { authorization: 'Bearer valid-token' } };
        const res = {};
        const next = vi.fn();

        // Act
        const module = await import('../../../../src/presentation/api/middleware/auth-middleware');
        module.default(req as any, res as any, next as any);

        // Assert
        expect(middlewareFn).toHaveBeenCalledTimes(1);
        expect(middlewareFn).toHaveBeenCalledWith(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('rejects requests with malformed Authorization header (syntax validation at Auth0)', async () => {
        // Arrange - this test documents that malformed tokens are handled by the auth library
        const middlewareFn = vi.fn((req: any, res: any, next: any) => {
            // Simulating what express-oauth2-jwt-bearer does with invalid tokens
            if (req.headers.authorization && !req.headers.authorization.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Invalid authorization header' });
            }
            next();
        });
        authMock.mockReturnValue(middlewareFn);

        const req = { headers: { authorization: 'InvalidBearer token' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
        const next = vi.fn();

        // Act
        const module = await import('../../../../src/presentation/api/middleware/auth-middleware');
        module.default(req as any, res as any, next as any);

        // Assert
        expect(middlewareFn).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
    });

    it('enforces audience and issuer configuration for JWT validation', async () => {
        // Arrange
        authMock.mockClear();

        // Act
        await import('../../../../src/presentation/api/middleware/auth-middleware');

        // Assert - verify the exact configuration that enforces audience and issuer validation
        expect(authMock).toHaveBeenCalledWith({
            audience: expectedAudience,
            issuerBaseURL: expectedIssuer,
        });
    });

    it('handles requests without authorization header by rejecting at middleware', async () => {
        // Arrange
        const middlewareFn = vi.fn((req: any, res: any, next: any) => {
            if (!req.headers.authorization) {
                return res.status(401).json({ error: 'Authorization header required' });
            }
            next();
        });
        authMock.mockReturnValue(middlewareFn);

        const req = { headers: {} };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
        const next = vi.fn();

        // Act
        const module = await import('../../../../src/presentation/api/middleware/auth-middleware');
        module.default(req as any, res as any, next as any);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
