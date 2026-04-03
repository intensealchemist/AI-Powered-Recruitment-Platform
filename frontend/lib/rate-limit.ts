import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Fallback dummy limiter that allows everything if KV is not configured
const dummyLimiter = {
  limit: async () => ({ success: true, pending: Promise.resolve() }),
};

// Create a new ratelimiter that allows 5 requests per 10 seconds for AI endpoints
export const aiLimiter = hasKv
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
      // Optional prefix
      prefix: "@upstash/ratelimit/ai",
    })
  : (dummyLimiter as unknown as Ratelimit);

// Create a secondary ratelimiter for authentication/heavy endpoints (e.g. 10 requests per 1 minute)
export const apiLimiter = hasKv
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/api",
    })
  : (dummyLimiter as unknown as Ratelimit);
