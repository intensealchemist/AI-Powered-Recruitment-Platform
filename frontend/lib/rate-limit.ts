import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

// Create a new ratelimiter that allows 5 requests per 10 seconds for AI endpoints
export const aiLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
  // Optional prefix
  prefix: "@upstash/ratelimit/ai",
});

// Create a secondary ratelimiter for authentication/heavy endpoints (e.g. 10 requests per 1 minute)
export const apiLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/api",
});
