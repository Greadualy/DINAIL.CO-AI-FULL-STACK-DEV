/**
 * Lightweight in-memory rate limiter for compute-heavy endpoints
 * Provides protection against DoS and compute resource exhaustion without external dependencies.
 */
const rateLimitMap = new Map();

const createRateLimiter = ({ windowMs = 60 * 1000, maxRequests = 20 } = {}) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    rateLimitMap.set(ip, record);

    // Periodic map sweep if size grows large
    if (rateLimitMap.size > 10000) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.resetAt) rateLimitMap.delete(key);
      }
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Terlalu banyak permintaan ke layanan AI. Harap tunggu beberapa saat sebelum mencoba lagi.',
      });
    }

    return next();
  };
};

module.exports = {
  aiRateLimiter: createRateLimiter({ windowMs: 60 * 1000, maxRequests: 20 }),
};
