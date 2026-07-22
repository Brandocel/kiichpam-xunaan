"use client";

import { FormEvent, useEffect, useState } from "react";

import { ADMIN_ROLES, type AdminRole } from "@/shared/lib/admin-auth";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  role: "AUDITOR",
};

function roleLabel(role: string): string {
  return ADMIN_ROLES.find((item) => item.role === role)?.label ?? role;
}

export default function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudieron cargar los usuarios.");
      }

      setUsers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Error al cargar usuarios."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!editingUser && form.password.trim().length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (editingUser && form.password && form.password.trim().length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsSaving(true);

    try {
      let response: Response;

      if (editingUser) {
        const body: Record<string, unknown> = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
        };

        if (form.password.trim()) {
          body.password = form.password.trim();
        }

        response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password.trim(),
            role: form.role,
          }),
        });
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "No se pudo guardar el usuario.");
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "No se pudo guardar."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    setBusyId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message);
      }

      await loadUsers();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado."
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `¿Eliminar al usuario "${user.name}" (${user.email})? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setBusyId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message);
      }

      await loadUsers();
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "No se pudo eliminar."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
          Seguridad
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Usuarios</h1>
        <p className="mt-2 text-sm text-slate-500">
          Administra los usuarios internos del panel administrativo y su rol.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Actualizar
            </button>
            <span className="text-sm text-slate-400">
              {users.length} usuario{users.length === 1 ? "" : "s"}
            </span>
          </div>

          <button
            onClick={openCreate}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Nuevo usuario
          </button>
        </div>

        {loadError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Nombre
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Correo
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Rol
                </th>
                <th className="py-3 text-left text-xs font-bold uppercase text-slate-400">
                  Estado
                </th>
                <th className="py-3 text-right text-xs font-bold uppercase text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    Aún no hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 text-sm font-bold text-slate-900">
                      {user.name}
                    </td>
                    <td className="py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-4 text-sm font-semibold text-slate-700">
                      {roleLabel(user.role)}
                    </td>
                    <td className="py-4">
                      {user.isActive ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          disabled={busyId === user.id}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={busyId === user.id}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          {user.isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          disabled={busyId === user.id}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950">
              {editingUser ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingUser
                ? "Actualiza los datos y el rol del usuario."
                : "Crea un usuario interno y asígnale un rol."}
            </p>

            {formError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Correo
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Contraseña{" "}
                  {editingUser && (
                    <span className="font-normal text-slate-400">
                      (dejar en blanco para no cambiarla)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder={editingUser ? "••••••••" : "Mínimo 8 caracteres"}
                  className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as AdminRole })
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10"
                >
                  {ADMIN_ROLES.map((item) => (
                    <option key={item.role} value={item.role}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  {ADMIN_ROLES.find((item) => item.role === form.role)
                    ?.description}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSaving
                    ? "Guardando..."
                    : editingUser
                    ? "Guardar cambios"
                    : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
