"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import type { AdminRoleMeta } from "@/shared/lib/admin-auth";
import {
  ADMIN_PERMISSION_GROUPS,
  VIEW_PERMISSIONS,
} from "@/shared/lib/admin-permissions";

type RolePermissionsMap = Record<string, string[]>;

type RolesApiPayload = {
  roles: AdminRoleMeta[];
  permissions: RolePermissionsMap;
  defaults: RolePermissionsMap;
  updatedAt: string | null;
  updatedBy: string | null;
};

const LOCKED_ROLE = "SUPER_ADMIN";

function toSets(map: RolePermissionsMap) {
  return Object.entries(map).reduce<Record<string, Set<string>>>(
    (acc, [role, permissions]) => {
      acc[role] = new Set(permissions);

      return acc;
    },
    {}
  );
}

function areSamePermissions(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;

  const setB = new Set(b);

  return a.every((permission) => setB.has(permission));
}

async function fetchRolesPayload(): Promise<RolesApiPayload> {
  const response = await fetch("/api/admin/roles", { cache: "no-store" });
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "No se pudieron cargar los roles.");
  }

  return result.data as RolesApiPayload;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={["animate-pulse bg-slate-300/70", className].join(" ")} />
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>

      {hint ? (
        <p className="mt-1 text-[11px] font-semibold text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function PermissionCheckbox({
  checked,
  disabled,
  onChange,
  title,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={onChange}
      className={[
        "inline-flex h-7 w-7 items-center justify-center border text-sm font-black transition",
        disabled
          ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"
          : checked
            ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
            : "border-slate-400 bg-white text-transparent hover:border-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M5 12.5L10 17.5L19 7"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function RolesPermissionsManager({
  canEdit,
}: {
  canEdit: boolean;
}) {
  const [roles, setRoles] = useState<AdminRoleMeta[]>([]);
  const [saved, setSaved] = useState<RolePermissionsMap>({});
  const [defaults, setDefaults] = useState<RolePermissionsMap>({});
  const [draft, setDraft] = useState<Record<string, Set<string>>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [onlyViewPermissions, setOnlyViewPermissions] = useState(false);

  const applyPayload = (payload: RolesApiPayload) => {
    setRoles(payload.roles || []);
    setSaved(payload.permissions || {});
    setDefaults(payload.defaults || {});
    setDraft(toSets(payload.permissions || {}));
    setUpdatedAt(payload.updatedAt);
    setUpdatedBy(payload.updatedBy);
  };

  const loadRoles = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      applyPayload(await fetchRolesPayload());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error al cargar los roles."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchRolesPayload()
      .then((payload) => {
        if (!cancelled) applyPayload(payload);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Error al cargar los roles."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const draftAsMap = useMemo(() => {
    return Object.entries(draft).reduce<RolePermissionsMap>(
      (acc, [role, permissions]) => {
        acc[role] = Array.from(permissions);

        return acc;
      },
      {}
    );
  }, [draft]);

  const changedRoles = useMemo(() => {
    return roles
      .map((role) => role.role)
      .filter(
        (role) => !areSamePermissions(draftAsMap[role], saved[role] || [])
      );
  }, [roles, draftAsMap, saved]);

  const hasChanges = changedRoles.length > 0;

  const groups = useMemo(() => {
    if (!onlyViewPermissions) return ADMIN_PERMISSION_GROUPS;

    return ADMIN_PERMISSION_GROUPS.map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (permission) => permission.kind === "view"
      ),
    })).filter((group) => group.permissions.length > 0);
  }, [onlyViewPermissions]);

  const totalPermissions = useMemo(
    () =>
      ADMIN_PERMISSION_GROUPS.reduce(
        (acc, group) => acc + group.permissions.length,
        0
      ),
    []
  );

  const mutateRole = (role: string, mutate: (set: Set<string>) => void) => {
    if (!canEdit || role === LOCKED_ROLE) return;

    setSuccessMessage("");

    setDraft((prev) => {
      const next = new Set(prev[role] ?? []);

      mutate(next);

      return { ...prev, [role]: next };
    });
  };

  const togglePermission = (role: string, permission: string) => {
    mutateRole(role, (set) => {
      if (set.has(permission)) {
        set.delete(permission);
      } else {
        set.add(permission);
      }
    });
  };

  const setGroupForRole = (
    role: string,
    permissions: string[],
    enabled: boolean
  ) => {
    mutateRole(role, (set) => {
      permissions.forEach((permission) => {
        if (enabled) {
          set.add(permission);
        } else {
          set.delete(permission);
        }
      });
    });
  };

  const setAllForRole = (role: string, enabled: boolean) => {
    const everyPermission = ADMIN_PERMISSION_GROUPS.flatMap((group) =>
      group.permissions.map((permission) => permission.key)
    );

    setGroupForRole(role, everyPermission, enabled);
  };

  const restoreRoleDefaults = (role: string) => {
    if (!canEdit || role === LOCKED_ROLE) return;

    setSuccessMessage("");
    setDraft((prev) => ({
      ...prev,
      [role]: new Set(defaults[role] ?? []),
    }));
  };

  const discardChanges = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setDraft(toSets(saved));
  };

  const restoreAllDefaults = () => {
    if (!canEdit) return;

    setSuccessMessage("");
    setDraft(toSets(defaults));
  };

  const handleSave = async () => {
    if (!canEdit || !hasChanges) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: draftAsMap }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudieron guardar los cambios.");
      }

      setSaved(result.data.permissions);
      setDraft(toSets(result.data.permissions));
      setUpdatedAt(result.data.updatedAt);
      setUpdatedBy(result.data.updatedBy);
      setSuccessMessage(result.message || "Permisos actualizados.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error al guardar."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const countFor = (role: string) => draft[role]?.size ?? 0;

  const sectionsFor = (role: string) =>
    VIEW_PERMISSIONS.filter((permission) => draft[role]?.has(permission.key))
      .length;

  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(updatedAt))
    : "Sin cambios guardados";

  return (
    <section className="space-y-5">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                Seguridad
              </p>

              <h1 className="mt-2 text-3xl font-black">Roles y permisos</h1>

              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-300">
                Marca qué puede ver y hacer cada rol. Los permisos de vista son
                los que abren cada sección del menú; el resto habilita acciones
                dentro de esa sección.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Roles
                </p>

                <p className="mt-1 text-xl font-black">{roles.length}</p>
              </div>

              <div className="border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Permisos
                </p>

                <p className="mt-1 text-xl font-black">{totalPermissions}</p>
              </div>

              <div className="border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Secciones
                </p>

                <p className="mt-1 text-xl font-black">
                  {VIEW_PERMISSIONS.length}
                </p>
              </div>

              <div className="border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Sin guardar
                </p>

                <p className="mt-1 text-xl font-black">{changedRoles.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-slate-50 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyViewPermissions((prev) => !prev)}
              className={[
                "border px-3 py-1.5 text-xs font-black transition",
                onlyViewPermissions
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              Solo permisos de vista
            </button>

            <p className="text-xs font-semibold text-slate-500">
              Última edición: {updatedLabel}
              {updatedBy ? ` · ${updatedBy}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              onClick={loadRoles}
              disabled={isLoading || isSaving}
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Actualizando..." : "Actualizar"}
            </button>

            <button
              type="button"
              onClick={restoreAllDefaults}
              disabled={!canEdit || isLoading || isSaving}
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Restaurar por defecto
            </button>

            <button
              type="button"
              onClick={discardChanges}
              disabled={!hasChanges || isSaving}
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Descartar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canEdit || !hasChanges || isSaving}
              className="bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {!canEdit && (
        <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          Tu rol puede consultar los permisos pero no modificarlos. Necesitas el
          permiso “Editar permisos de roles”.
        </div>
      )}

      {errorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      {hasChanges && (
        <div className="border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
          Cambios sin guardar en:{" "}
          {changedRoles
            .map(
              (role) => roles.find((item) => item.role === role)?.label ?? role
            )
            .join(", ")}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Roles editables"
          value={Math.max(roles.length - 1, 0)}
          hint="Super Admin queda fijo por seguridad"
        />

        <StatCard label="Permisos por rol" value={totalPermissions} />

        <StatCard
          label="Permisos de vista"
          value={VIEW_PERMISSIONS.length}
          hint="Controlan el acceso a cada sección"
        />

        <StatCard
          label="Roles modificados"
          value={changedRoles.length}
          hint={hasChanges ? "Pendientes de guardar" : "Todo guardado"}
        />
      </div>

      <div className="border border-slate-300 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-300 bg-slate-100 px-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              Matriz de permisos
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Cada columna es un rol y cada fila un permiso. Los cambios aplican
              a los usuarios de ese rol al volver a iniciar sesión.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-slate-300">
          <table className="min-w-full border-collapse">
            <thead className="border-b border-slate-400 bg-slate-200">
              <tr>
                <th className="sticky left-0 z-10 min-w-[280px] border-r border-slate-300 bg-slate-200 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Permiso
                </th>

                {isLoading
                  ? Array.from({ length: 7 }).map((_, index) => (
                      <th
                        key={index}
                        className="border-r border-slate-300 px-3 py-3 last:border-r-0"
                      >
                        <SkeletonBlock className="mx-auto h-4 w-20" />
                      </th>
                    ))
                  : roles.map((role) => {
                      const isLocked = role.role === LOCKED_ROLE;

                      return (
                        <th
                          key={role.role}
                          className="min-w-[150px] border-r border-slate-300 px-3 py-3 text-center align-top last:border-r-0"
                        >
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                            {role.label}
                          </p>

                          <p className="mt-1 text-[11px] font-bold text-slate-500">
                            {countFor(role.role)}/{totalPermissions} ·{" "}
                            {sectionsFor(role.role)} secc.
                          </p>

                          {isLocked ? (
                            <span className="mt-2 inline-flex border border-slate-400 bg-slate-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-700">
                              Fijo
                            </span>
                          ) : (
                            <div className="mt-2 flex justify-center gap-1">
                              <button
                                type="button"
                                disabled={!canEdit}
                                onClick={() => setAllForRole(role.role, true)}
                                className="border border-slate-400 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Todo
                              </button>

                              <button
                                type="button"
                                disabled={!canEdit}
                                onClick={() => setAllForRole(role.role, false)}
                                className="border border-slate-400 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Nada
                              </button>

                              <button
                                type="button"
                                disabled={!canEdit}
                                onClick={() => restoreRoleDefaults(role.role)}
                                title="Restaurar los permisos por defecto de este rol"
                                className="border border-slate-400 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </th>
                      );
                    })}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-100/80"}
                  >
                    <td className="sticky left-0 z-10 border-r border-slate-300/70 bg-inherit px-4 py-3">
                      <SkeletonBlock className="h-4 w-48" />
                    </td>

                    {Array.from({ length: 7 }).map((__, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-r border-slate-300/70 px-3 py-3 last:border-r-0"
                      >
                        <SkeletonBlock className="mx-auto h-7 w-7" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                groups.map((group) => {
                  const groupKeys = group.permissions.map(
                    (permission) => permission.key
                  );

                  return (
                    <Fragment key={group.key}>
                      <tr className="bg-slate-800 text-white">
                        <td className="sticky left-0 z-10 border-r border-slate-700 bg-slate-800 px-4 py-2.5">
                          <p className="text-[11px] font-black uppercase tracking-wider">
                            {group.label}
                          </p>

                          <p className="mt-0.5 text-[11px] font-medium text-slate-300">
                            {group.description}
                          </p>
                        </td>

                        {roles.map((role) => {
                          const isLocked = role.role === LOCKED_ROLE;

                          const allChecked = groupKeys.every((key) =>
                            draft[role.role]?.has(key)
                          );

                          return (
                            <td
                              key={role.role}
                              className="border-r border-slate-700 px-3 py-2.5 text-center last:border-r-0"
                            >
                              <button
                                type="button"
                                disabled={!canEdit || isLocked}
                                onClick={() =>
                                  setGroupForRole(
                                    role.role,
                                    groupKeys,
                                    !allChecked
                                  )
                                }
                                className="border border-white/30 bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                {allChecked ? "Quitar" : "Todo"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>

                      {group.permissions.map((permission, index) => (
                        <tr
                          key={permission.key}
                          className={[
                            "border-l-4 transition-colors duration-150",
                            permission.kind === "view"
                              ? "border-l-emerald-500"
                              : "border-l-slate-300",
                            index % 2 === 0 ? "bg-white" : "bg-slate-100/80",
                            "hover:bg-slate-200/70",
                          ].join(" ")}
                        >
                          <td className="sticky left-0 z-10 border-r border-slate-300/70 bg-inherit px-4 py-3">
                            <div className="flex items-start gap-2">
                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  {permission.label}
                                </p>

                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                  {permission.description}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <span className="border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                                    {permission.key}
                                  </span>

                                  {permission.kind === "view" ? (
                                    <span className="border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                      Vista · {permission.route}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </td>

                          {roles.map((role) => {
                            const isLocked = role.role === LOCKED_ROLE;
                            const checked =
                              draft[role.role]?.has(permission.key) ?? false;

                            const isDefault = (
                              defaults[role.role] || []
                            ).includes(permission.key);

                            return (
                              <td
                                key={role.role}
                                className="border-r border-slate-300/70 px-3 py-3 text-center last:border-r-0"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <PermissionCheckbox
                                    checked={checked}
                                    disabled={!canEdit || isLocked}
                                    onChange={() =>
                                      togglePermission(
                                        role.role,
                                        permission.key
                                      )
                                    }
                                    title={`${role.label} · ${permission.label}`}
                                  />

                                  {!isLocked && checked !== isDefault ? (
                                    <span className="text-[9px] font-black uppercase tracking-wide text-amber-600">
                                      {checked ? "+" : "−"} cambio
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-300 bg-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-bold text-slate-600">
            El riel verde marca los permisos de vista: son los que hacen aparecer
            la sección en el menú lateral.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={discardChanges}
              disabled={!hasChanges || isSaving}
              className="border border-slate-400 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Descartar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canEdit || !hasChanges || isSaving}
              className="bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      <div className="border border-slate-300 bg-white">
        <div className="border-b border-slate-300 bg-slate-100 px-4 py-4">
          <h2 className="text-lg font-black text-slate-950">
            Resumen por rol
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Qué secciones del menú verá cada rol con la selección actual.
          </p>
        </div>

        <div className="grid gap-px bg-slate-300 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            const visibleSections = VIEW_PERMISSIONS.filter((permission) =>
              draft[role.role]?.has(permission.key)
            );

            return (
              <div key={role.role} className="bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-black text-slate-950">
                    {role.label}
                  </h3>

                  <span className="whitespace-nowrap border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-slate-600">
                    {countFor(role.role)} permisos
                  </span>
                </div>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {role.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {visibleSections.length === 0 ? (
                    <span className="border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-red-700">
                      Sin acceso al panel
                    </span>
                  ) : (
                    visibleSections.map((permission) => (
                      <span
                        key={permission.key}
                        className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700"
                      >
                        {permission.label.replace("Ver ", "")}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
