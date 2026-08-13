import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { SESSION_MAX_AGE_SECONDS } from "@/lib/config/constants";
import { getEnv } from "@/lib/config/env";
import { AppError } from "@/lib/errors";

const SESSION_COOKIE = "session";

export type SessionPayload = {
  userId: string;
  accountId: string;
  email: string;
  accountName: string;
  accountSlug: string;
};

function getSecretKey() {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

export async function createSession(payload: SessionPayload) {
  const env = getEnv();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.accountId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      accountId: payload.accountId,
      email: payload.email,
      accountName:
        typeof payload.accountName === "string" ? payload.accountName : "My Store",
      accountSlug:
        typeof payload.accountSlug === "string" ? payload.accountSlug : "",
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AppError("Unauthorized", 401);
  }
  return session;
}
