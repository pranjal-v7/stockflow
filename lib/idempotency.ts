import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const IDEMPOTENCY_TTL = 60 * 60 * 24; // 24 hours in seconds

/**
 * Idempotency middleware for API routes.
 *
 * Usage:
 *   const idempotencyResult = await checkIdempotency(req);
 *   if (idempotencyResult) return idempotencyResult; // cached response
 *   // ... do the work ...
 *   await cacheIdempotencyResult(key, responseData, status);
 */
export async function checkIdempotency(req: Request): Promise<NextResponse | null> {
  const key = req.headers.get("Idempotency-Key");
  if (!key) return null;

  const cached = await redis.get<{ data: unknown; status: number }>(`idempotency:${key}`);
  if (cached) {
    // Return cached response — client gets same result without re-processing
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: { "X-Idempotency-Replayed": "true" },
    });
  }

  return null;
}

export async function cacheIdempotencyResult(
  req: Request,
  data: unknown,
  status: number
): Promise<void> {
  const key = req.headers.get("Idempotency-Key");
  if (!key) return;

  await redis.set(
    `idempotency:${key}`,
    { data, status },
    { ex: IDEMPOTENCY_TTL }
  );
}
