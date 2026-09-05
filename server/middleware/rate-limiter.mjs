/**
 * server/middleware/rate-limiter.mjs — Enterprise Sliding-Window Rate Limiter
 * Protects endpoints from brute-force, scraping, and DoS attacks.
 */

const rateLimitStores = new Map(); // tier -> Map(ip -> { count, resetAt })

// Configured Tiers
const TIERS = {
    lead: { windowMs: 60000, max: 10, message: 'Bạn đang gửi thông tin quá nhanh. Vui lòng chờ 1 phút.' },
    auth: { windowMs: 60000, max: 25, message: 'Quá nhiều lần thử đăng nhập/đăng ký. Vui lòng chờ 1 phút.' },
    api: { windowMs: 60000, max: 120, message: 'Tần suất gửi yêu cầu quá lớn. Vui lòng thử lại sau.' },
    admin: { windowMs: 60000, max: 200, message: 'Quá giới hạn thao tác quản trị.' }
};

// Periodic Memory Garbage Collection (every 5 mins)
setInterval(() => {
    const now = Date.now();
    for (const [tierName, store] of rateLimitStores.entries()) {
        const tier = TIERS[tierName] || { windowMs: 60000 };
        for (const [ip, entry] of store.entries()) {
            if (now > entry.resetAt + tier.windowMs) {
                store.delete(ip);
            }
        }
    }
}, 300000).unref();

function getStore(tierName) {
    if (!rateLimitStores.has(tierName)) {
        rateLimitStores.set(tierName, new Map());
    }
    return rateLimitStores.get(tierName);
}

export function checkRateLimit(req, tierName = 'api') {
    const tier = TIERS[tierName] || TIERS.api;
    const store = getStore(tierName);
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
        .split(',')[0].trim();
    const now = Date.now();

    const entry = store.get(clientIp) || { count: 0, resetAt: now + tier.windowMs };
    if (now > entry.resetAt) {
        entry.count = 1;
        entry.resetAt = now + tier.windowMs;
        store.set(clientIp, entry);
        return { limited: false, remaining: tier.max - 1 };
    }

    entry.count++;
    store.set(clientIp, entry);

    if (entry.count > tier.max) {
        return {
            limited: true,
            message: tier.message,
            retryAfterSec: Math.ceil((entry.resetAt - now) / 1000)
        };
    }

    return { limited: false, remaining: tier.max - entry.count };
}
