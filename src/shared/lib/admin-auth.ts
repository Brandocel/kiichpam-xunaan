export const ADMIN_COOKIE_NAME = "kiichpam_admin_session";

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SALES"
  | "ACCOUNTING"
  | "VIEWER";

export type AdminSessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"]
  );
}

async function signData(data: string, secret: string): Promise<string> {
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const key = await getHmacKey(secret);

    return crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      encoder.encode(data)
    );
  } catch {
    return false;
  }
}

export async function createAdminSessionToken(
  payload: AdminSessionPayload,
  secret: string
): Promise<string> {
  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = base64UrlEncode(encoder.encode(payloadJson));
  const signature = await signData(payloadEncoded, secret);

  return `${payloadEncoded}.${signature}`;
}

export async function verifyAdminSession(
  token: string | undefined,
  secret: string
): Promise<AdminSessionPayload | null> {
  if (!token) return null;

  const [payloadEncoded, signature] = token.split(".");

  if (!payloadEncoded || !signature) return null;

  const isValid = await verifySignature(payloadEncoded, signature, secret);

  if (!isValid) return null;

  try {
    const payloadJson = decoder.decode(base64UrlDecode(payloadEncoded));
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;

    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    "kiichpam_admin_dev_secret_change_this_value"
  );
}

export const ADMIN_PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",

  RESERVATIONS_VIEW: "reservations.view",
  RESERVATIONS_CREATE: "reservations.create",
  RESERVATIONS_UPDATE: "reservations.update",
  RESERVATIONS_CANCEL: "reservations.cancel",
  RESERVATIONS_CHANGE_STATUS: "reservations.change_status",
  RESERVATIONS_EXPORT: "reservations.export",

  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DISABLE: "users.disable",

  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",

  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_REFUND: "payments.refund",
  PAYMENTS_EXPORT: "payments.export",

  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
} as const;

export const SUPER_ADMIN_PERMISSIONS = Object.values(ADMIN_PERMISSIONS);