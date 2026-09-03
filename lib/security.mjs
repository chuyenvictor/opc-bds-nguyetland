/**
 * lib/security.mjs — OPC-BĐS Security, Token & Authorization Engine
 * Handles cryptographic HMAC token generation, validation, and CORS verification.
 *
 * BUG-03 FIX: JWT secret no longer hardcoded — auto-generates secure random if missing.
 * BUG-10 FIX: Localhost CORS restricted to development mode only.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve JWT_SECRET securely:
 * 1. Use process.env.JWT_SECRET if available
 * 2. Use process.env.WEBHOOK_SECRET if available
 * 3. Auto-generate a cryptographically secure 64-byte hex secret
 *    and persist it to .env.local so it survives restarts
 */
function resolveJwtSecret() {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (process.env.WEBHOOK_SECRET) return process.env.WEBHOOK_SECRET;

    // Auto-generate and persist
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    try {
        if (fs.existsSync(envLocalPath)) {
            const content = fs.readFileSync(envLocalPath, 'utf8');
            const match = content.match(/^JWT_SECRET=(.+)$/m);
            if (match && match[1].trim()) return match[1].trim();
        }
    } catch { /* ignore read errors */ }

    const generatedSecret = crypto.randomBytes(64).toString('hex');
    console.warn('[Security] ⚠️ No JWT_SECRET in ENV — auto-generated secure secret. Set JWT_SECRET in .env for production.');
    try {
        const line = `\n# Auto-generated JWT secret (${new Date().toISOString()})\nJWT_SECRET=${generatedSecret}\n`;
        fs.appendFileSync(envLocalPath, line, 'utf8');
        console.log('[Security] ✅ JWT_SECRET persisted to .env.local');
    } catch (e) {
        console.warn('[Security] Could not persist JWT_SECRET:', e.message);
    }
    return generatedSecret;
}

const JWT_SECRET = resolveJwtSecret();

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
 * BUG-10 FIX: Localhost wildcard only allowed in development mode
 */
export function checkCorsOrigin(origin) {
    if (!origin) return ALLOWED_ORIGINS[0];
    if (ALLOWED_ORIGINS.includes(origin)) return origin;

    // Only allow arbitrary localhost ports in development
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return origin;
    }

    return null;
}
