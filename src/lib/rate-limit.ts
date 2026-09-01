type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: State is per-process. On serverless platforms each invocation may
 * start a fresh process, so this is a defense-in-depth measure rather than a
 * global guarantee. It is effective for self-hosted / long-running
 * deployments. Production deployments should back this with a shared store
 * (e.g. Redis, Upstash) if global enforcement is required.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function rateLimitByIp(req: Request, limit: number, windowMs: number) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return rateLimit(`ip:${ip}`, limit, windowMs);
}
