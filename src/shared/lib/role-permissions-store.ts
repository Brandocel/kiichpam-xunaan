import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  isAdminRole,
  type AdminRole,
} from "./admin-auth";
import { isKnownPermission } from "./admin-permissions";

export type RolePermissionsMap = Record<AdminRole, string[]>;

export type RolePermissionsStoreState = {
  permissions: RolePermissionsMap;
  updatedAt: string | null;
  updatedBy: string | null;
};

/**
 * Persistencia de la matriz rol → permisos.
 *
 * Este repo no tiene base de datos propia (todo lo persistente vive en
 * kiichpam-api), así que los overrides se guardan en un JSON en disco.
 *
 * IMPORTANTE: en DigitalOcean App Platform el filesystem es efímero, así que
 * los cambios se pierden en cada redeploy salvo que apuntes
 * ADMIN_ROLES_STORE_PATH a un volumen persistente. La solución definitiva es
 * mover este store a una tabla en kiichpam-api: toda la lectura/escritura pasa
 * por readStore/writeStore, así que solo hay que cambiar esas dos funciones.
 */
const DEFAULT_STORE_PATH = path.join(".data", "role-permissions.json");

function getStorePath() {
  /**
   * Ruta relativa a propósito: node la resuelve contra el cwd del proceso y
   * así evitamos un process.cwd() dinámico que hace que Turbopack trace todo
   * el proyecto en el bundle de la ruta.
   */
  return process.env.ADMIN_ROLES_STORE_PATH || DEFAULT_STORE_PATH;
}

const ALL_ROLES = ADMIN_ROLES.map((role) => role.role);

/**
 * Mantiene siempre el mismo orden de permisos para que los diffs y la UI sean
 * estables sin importar cómo llegó el arreglo.
 */
const ALL_PERMISSION_ORDER = Object.values(ADMIN_PERMISSIONS) as string[];

function cloneDefaults(): RolePermissionsMap {
  return ALL_ROLES.reduce((acc, role) => {
    acc[role] = [...(ROLE_PERMISSIONS[role] ?? [])];

    return acc;
  }, {} as RolePermissionsMap);
}

/**
 * Reglas de seguridad que se aplican siempre, vengan de donde vengan los datos:
 *
 * 1. SUPER_ADMIN conserva todos los permisos. Es la salvaguarda contra quedarse
 *    fuera del panel por un guardado accidental.
 * 2. Quien pueda editar roles necesita también poder verlos, si no perdería el
 *    acceso a la pantalla donde se corrige el error.
 * 3. Solo se aceptan permisos y roles del catálogo, sin duplicados.
 */
export function sanitizeRolePermissions(
  input: Partial<Record<string, unknown>>
): RolePermissionsMap {
  const defaults = cloneDefaults();

  const result = ALL_ROLES.reduce((acc, role) => {
    const raw = input?.[role];

    if (!Array.isArray(raw)) {
      acc[role] = defaults[role];

      return acc;
    }

    const cleaned = Array.from(
      new Set(
        raw
          .map((value) => String(value))
          .filter((value) => isKnownPermission(value))
      )
    );

    acc[role] = cleaned;

    return acc;
  }, {} as RolePermissionsMap);

  result.SUPER_ADMIN = [...SUPER_ADMIN_PERMISSIONS];

  ALL_ROLES.forEach((role) => {
    const permissions = new Set(result[role]);

    if (permissions.has(ADMIN_PERMISSIONS.ROLES_UPDATE)) {
      permissions.add(ADMIN_PERMISSIONS.ROLES_VIEW);
    }

    result[role] = ALL_PERMISSION_ORDER.filter((permission) =>
      permissions.has(permission)
    );
  });

  return result;
}

async function readStore(): Promise<RolePermissionsStoreState> {
  const storePath = getStorePath();

  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      permissions: sanitizeRolePermissions(parsed?.permissions ?? {}),
      updatedAt:
        typeof parsed?.updatedAt === "string" ? parsed.updatedAt : null,
      updatedBy:
        typeof parsed?.updatedBy === "string" ? parsed.updatedBy : null,
    };
  } catch {
    /**
     * Si el archivo no existe todavía (o quedó corrupto) devolvemos los
     * permisos por defecto en lugar de reventar el panel.
     */
    return {
      permissions: cloneDefaults(),
      updatedAt: null,
      updatedBy: null,
    };
  }
}

async function writeStore(state: RolePermissionsStoreState) {
  const storePath = getStorePath();

  await mkdir(path.dirname(storePath), { recursive: true });

  await writeFile(storePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function getRolePermissionsState(): Promise<RolePermissionsStoreState> {
  return readStore();
}

export async function saveRolePermissions({
  permissions,
  updatedBy,
}: {
  permissions: Partial<Record<string, unknown>>;
  updatedBy?: string | null;
}): Promise<RolePermissionsStoreState> {
  const state: RolePermissionsStoreState = {
    permissions: sanitizeRolePermissions(permissions),
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy ?? null,
  };

  await writeStore(state);

  return state;
}

export async function resetRolePermissions(
  updatedBy?: string | null
): Promise<RolePermissionsStoreState> {
  return saveRolePermissions({
    permissions: cloneDefaults(),
    updatedBy,
  });
}

/**
 * Permisos efectivos de un rol: overrides guardados si existen, defaults si no.
 * Lo usa el login para armar la cookie de sesión.
 */
export async function getEffectivePermissionsForRole(
  role: string
): Promise<string[]> {
  if (!isAdminRole(role)) {
    return [];
  }

  const state = await readStore();

  return state.permissions[role] ?? [];
}

export function getDefaultRolePermissions(): RolePermissionsMap {
  return cloneDefaults();
}
