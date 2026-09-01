/**
 * lib/security.mjs — OPC-BĐS Security, Token & Authorization Engine
 * Handles cryptographic HMAC token generation, validation, and CORS verification.
 */
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.WEBHOOK_SECRET || 'OPC_BDS_MASTER_SECRET_2026_DANANG';

// Allowed CORS Origins Whitelist
const ALLOWED_ORIGINS = [
    'https://bds.breaths.live',
    'https://nguyetland.breaths.live',
    'https://opc-bds-nguyetland.pages.dev',
    'http://localhost:8088',
    'http://127.0.0.1:8088',
    'http://localhost:3000',
    'http://localhost:5173'
];

function base64UrlEncode(str) {
    return Buffer.from(str).toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Generate a cryptographically signed token for user sessions
 */
export function generateToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Date.now();
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify token and return payload if valid, null if invalid or expired
 */
export function verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    if (signature !== expectedSig) {
        return null; // Tampered token
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        if (payload.exp && payload.exp < Date.now()) {
            return null; // Expired
        }
        return payload;
    } catch {
        return null;
    }
}

/**
 * Extract token from request headers (Authorization: Bearer ...) or URL query
 */
export function extractToken(req) {
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    const url = new URL(req.url || '/', 'http://localhost');
    return url.searchParams.get('token') || '';
}

/**
 * Check if request has valid ADMIN permissions
 */
export function requireAdminAuth(req, res) {
    const token = extractToken(req);
    const user = verifyToken(token);

    if (!user || user.role !== 'ADMIN') {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            success: false,
            message: '401 Unauthorized — Yêu cầu quyền Quản Trị Viên (Admin)'
        }));
        return null;
    }
    return user;
}

/**
 * Check if request origin is in allowed whitelist
 */
export function checkCorsOrigin(origin) {
    if (!origin) return ALLOWED_ORIGINS[0];
    const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    return isAllowed ? origin : null;
}
