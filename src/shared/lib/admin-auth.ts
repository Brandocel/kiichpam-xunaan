export const ADMIN_COOKIE_NAME = "kiichpam_admin_session";

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "SALES"
  | "ACCOUNTING"
  | "VIEWER"
  | "AUDITOR";

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

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

/**
 * Convierte un Uint8Array a un ArrayBuffer normal.
 *
 * Esto evita el error de TypeScript:
 * Uint8Array<ArrayBufferLike> is not assignable to BufferSource
 *
 * El problema aparece en builds estrictos de Next/TypeScript cuando
 * crypto.subtle.verify espera un BufferSource compatible con ArrayBuffer.
 */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  const view = new Uint8Array(buffer);

  view.set(bytes);

  return buffer;
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

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );

  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const key = await getHmacKey(secret);

    const signatureBytes = base64UrlDecode(signature);
    const signatureBuffer = toArrayBuffer(signatureBytes);
    const dataBytes = encoder.encode(data);

    return crypto.subtle.verify("HMAC", key, signatureBuffer, dataBytes);
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
  if (!token) {
    return null;
  }

  const [payloadEncoded, signature] = token.split(".");

  if (!payloadEncoded || !signature) {
    return null;
  }

  const isValid = await verifySignature(payloadEncoded, signature, secret);

  if (!isValid) {
    return null;
  }

  try {
    const payloadBytes = base64UrlDecode(payloadEncoded);
    const payloadJson = decoder.decode(payloadBytes);
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

const P = ADMIN_PERMISSIONS;

/**
 * Permisos asignados a cada rol del panel administrativo.
 * Fuente única de verdad: el login construye los permisos de la sesión a
 * partir del rol usando este mapa.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,

  ADMIN: [
    P.DASHBOARD_VIEW,
    P.RESERVATIONS_VIEW,
    P.RESERVATIONS_CREATE,
    P.RESERVATIONS_UPDATE,
    P.RESERVATIONS_CANCEL,
    P.RESERVATIONS_CHANGE_STATUS,
    P.RESERVATIONS_EXPORT,
    P.USERS_VIEW,
    P.USERS_CREATE,
    P.USERS_UPDATE,
    P.USERS_DISABLE,
    P.ROLES_VIEW,
    P.PAYMENTS_VIEW,
    P.PAYMENTS_EXPORT,
    P.REPORTS_VIEW,
    P.REPORTS_EXPORT,
  ],

  MANAGER: [
    P.DASHBOARD_VIEW,
    P.RESERVATIONS_VIEW,
    P.RESERVATIONS_CREATE,
    P.RESERVATIONS_UPDATE,
    P.RESERVATIONS_CANCEL,
    P.RESERVATIONS_CHANGE_STATUS,
    P.RESERVATIONS_EXPORT,
    P.PAYMENTS_VIEW,
    P.REPORTS_VIEW,
  ],

  SALES: [
    P.DASHBOARD_VIEW,
    P.RESERVATIONS_VIEW,
    P.RESERVATIONS_CREATE,
    P.RESERVATIONS_UPDATE,
    P.RESERVATIONS_CHANGE_STATUS,
  ],

  ACCOUNTING: [
    P.DASHBOARD_VIEW,
    P.PAYMENTS_VIEW,
    P.PAYMENTS_EXPORT,
    P.REPORTS_VIEW,
    P.REPORTS_EXPORT,
  ],

  VIEWER: [P.DASHBOARD_VIEW, P.RESERVATIONS_VIEW],

  /**
   * Auditoría: acceso exclusivo de solo lectura a reservaciones.
   */
  AUDITOR: [P.RESERVATIONS_VIEW],
};

export type AdminRoleMeta = {
  role: AdminRole;
  label: string;
  description: string;
};

/**
 * Metadatos de los roles para mostrarlos en el panel (páginas Usuarios/Roles).
 */
export const ADMIN_ROLES: AdminRoleMeta[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Acceso completo a todo el sistema.",
  },
  {
    role: "ADMIN",
    label: "Administrador",
    description:
      "Gestiona reservaciones, usuarios, pagos y reportes (sin reembolsos).",
  },
  {
    role: "MANAGER",
    label: "Gerente",
    description: "Gestiona reservaciones y consulta pagos y reportes.",
  },
  {
    role: "SALES",
    label: "Ventas",
    description: "Crea y gestiona reservaciones de clientes.",
  },
  {
    role: "ACCOUNTING",
    label: "Contabilidad",
    description: "Consulta y exporta pagos y reportes.",
  },
  {
    role: "VIEWER",
    label: "Consulta",
    description: "Solo lectura de dashboard y reservaciones.",
  },
  {
    role: "AUDITOR",
    label: "Auditoría",
    description: "Solo lectura de reservaciones. Sin acceso a nada más.",
  },
];

/**
 * Devuelve los permisos correspondientes a un rol. Si el rol es desconocido,
 * devuelve un arreglo vacío (sin acceso) por seguridad.
 */
export function getPermissionsForRole(role: string): string[] {
  return ROLE_PERMISSIONS[role as AdminRole] ?? [];
}

export function isAdminRole(value: string): value is AdminRole {
  return value in ROLE_PERMISSIONS;
}