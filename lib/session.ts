export const ADMIN_COOKIE_NAME = "admin_session";

function getSecret(): string {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(signature);
}

/**
 * 管理者IDを署名付きトークンに変換する（"id.signature"形式）。
 */
export async function createSessionToken(employeeId: string): Promise<string> {
  const signature = await sign(employeeId);
  return `${employeeId}.${signature}`;
}

/**
 * トークンを検証し、有効なら管理者IDを返す。無効ならnull。
 */
export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const employeeId = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  const expected = await sign(employeeId);

  if (signature.length !== expected.length) return null;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  return employeeId;
}
