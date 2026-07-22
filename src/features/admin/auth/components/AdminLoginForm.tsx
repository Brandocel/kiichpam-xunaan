"use client";

import { FormEvent, CSSProperties, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type Star = {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: string;
  color: string;
};

const stars: Star[] = [
  {
    left: "12.6082%",
    top: "77.2809%",
    delay: "3.6231s",
    duration: "6.38011s",
    size: "12.5017px",
    color: "rgba(255, 255, 255, 0.098)",
  },
  {
    left: "23.6889%",
    top: "70.1223%",
    delay: "4.89886s",
    duration: "3.48766s",
    size: "8.51753px",
    color: "rgba(255, 255, 255, 0.157)",
  },
  {
    left: "41.0138%",
    top: "1.07303%",
    delay: "1.93359s",
    duration: "6.05585s",
    size: "21.6259px",
    color: "rgba(255, 255, 255, 0.153)",
  },
  {
    left: "64.529%",
    top: "48.2238%",
    delay: "2.19884s",
    duration: "6.31385s",
    size: "13.093px",
    color: "rgba(255, 255, 255, 0.255)",
  },
  {
    left: "26.916%",
    top: "78.4718%",
    delay: "1.44859s",
    duration: "6.75555s",
    size: "11.8408px",
    color: "rgba(255, 255, 255, 0.12)",
  },
  {
    left: "38.982%",
    top: "56.5062%",
    delay: "3.37466s",
    duration: "3.17857s",
    size: "9.27534px",
    color: "rgba(255, 255, 255, 0.227)",
  },
  {
    left: "39.1268%",
    top: "93.4209%",
    delay: "0.200031s",
    duration: "4.71741s",
    size: "13.939px",
    color: "rgba(255, 255, 255, 0.204)",
  },
  {
    left: "47.3247%",
    top: "4.32547%",
    delay: "1.28766s",
    duration: "4.38586s",
    size: "19.0638px",
    color: "rgba(255, 255, 255, 0.125)",
  },
  {
    left: "22.3953%",
    top: "84.871%",
    delay: "1.75296s",
    duration: "6.13326s",
    size: "21.3473px",
    color: "rgba(255, 255, 255, 0.106)",
  },
  {
    left: "14.4825%",
    top: "2.91479%",
    delay: "0.987266s",
    duration: "3.41276s",
    size: "11.3351px",
    color: "rgba(255, 255, 255, 0.204)",
  },
  {
    left: "91.5702%",
    top: "4.72594%",
    delay: "4.52092s",
    duration: "3.60537s",
    size: "18.4821px",
    color: "rgba(255, 255, 255, 0.098)",
  },
  {
    left: "68.4025%",
    top: "43.8059%",
    delay: "2.52635s",
    duration: "5.78884s",
    size: "20.5709px",
    color: "rgba(255, 255, 255, 0.114)",
  },
  {
    left: "66.0914%",
    top: "91.2603%",
    delay: "0.717725s",
    duration: "6.54063s",
    size: "8.58304px",
    color: "rgba(255, 255, 255, 0.204)",
  },
  {
    left: "5.32754%",
    top: "84.3864%",
    delay: "3.1016s",
    duration: "5.26142s",
    size: "16.3975px",
    color: "rgba(255, 255, 255, 0.2)",
  },
  {
    left: "90.0934%",
    top: "82.1644%",
    delay: "3.77817s",
    duration: "3.97863s",
    size: "8.68813px",
    color: "rgba(255, 255, 255, 0.098)",
  },
  {
    left: "70.8008%",
    top: "30.9781%",
    delay: "1.28488s",
    duration: "3.51196s",
    size: "14.468px",
    color: "rgba(255, 255, 255, 0.267)",
  },
  {
    left: "22.3506%",
    top: "67.4809%",
    delay: "4.767s",
    duration: "4.95156s",
    size: "18.4708px",
    color: "rgba(255, 255, 255, 0.22)",
  },
  {
    left: "20.9788%",
    top: "20.0366%",
    delay: "1.12959s",
    duration: "4.30227s",
    size: "8.70811px",
    color: "rgba(255, 255, 255, 0.235)",
  },
  {
    left: "51.8047%",
    top: "77.4922%",
    delay: "3.8086s",
    duration: "4.96131s",
    size: "18.9139px",
    color: "rgba(255, 255, 255, 0.275)",
  },
  {
    left: "36.5881%",
    top: "23.796%",
    delay: "0.722984s",
    duration: "3.55484s",
    size: "18.4178px",
    color: "rgba(255, 255, 255, 0.18)",
  },
];

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.message || "No se pudo iniciar sesión.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setErrorMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#383071] px-4 py-10">
      <div className="sparkle-field" aria-hidden="true">
        {stars.map((star, index) => (
          <div
            key={index}
            className="star"
            style={
              {
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                animationDuration: star.duration,
                fontSize: star.size,
                color: star.color,
              } as CSSProperties
            }
          >
            ✦
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-purple-300/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_45%)]" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/30 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Kiichpam Xunáan
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Panel administrativo
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Inicia sesión para gestionar reservaciones, pagos, usuarios, roles y
            reportes.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Correo
            </label>

            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-[#383071] focus:ring-4 focus:ring-[#383071]/10"
              placeholder="admin@kiichpam.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#383071] focus:ring-4 focus:ring-[#383071]/10"
                placeholder="********"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-[#383071] px-4 text-sm font-bold text-white transition hover:bg-[#2d265e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>

      <style>{`
        .sparkle-field {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .star {
          position: absolute;
          line-height: 1;
          opacity: 0.65;
          transform-origin: center;
          animation-name: sparkleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity, filter;
          user-select: none;
        }

        @keyframes sparkleFloat {
          0% {
            opacity: 0.15;
            transform: translate3d(0, 0, 0) scale(0.85) rotate(0deg);
            filter: blur(0px);
          }

          35% {
            opacity: 0.75;
            transform: translate3d(8px, -10px, 0) scale(1.15) rotate(90deg);
            filter: blur(0.2px);
          }

          70% {
            opacity: 0.35;
            transform: translate3d(-6px, 8px, 0) scale(0.95) rotate(180deg);
            filter: blur(0px);
          }

          100% {
            opacity: 0.15;
            transform: translate3d(0, 0, 0) scale(0.85) rotate(360deg);
            filter: blur(0px);
          }
        }
      `}</style>
    </section>
  );
}