type PageProps = {
    params: {
      locale: "es" | "en";
    };
  };
  
  const content = {
    es: {
      eyebrow: "Soporte",
      title: "Feedback",
      description:
        "Tu opinión nos ayuda a mejorar la experiencia de cada visitante en Ki’ichpam Xunaán.",
      formTitle: "Cuéntanos tu experiencia",
      name: "Nombre",
      email: "Correo electrónico",
      message: "Mensaje",
      button: "Enviar feedback",
      note: "Este formulario está listo visualmente. Puedes conectarlo después a tu API o servicio de contacto.",
    },
    en: {
      eyebrow: "Support",
      title: "Feedback",
      description:
        "Your opinion helps us improve every visitor experience at Ki’ichpam Xunaán.",
      formTitle: "Tell us about your experience",
      name: "Name",
      email: "Email",
      message: "Message",
      button: "Send feedback",
      note: "This form is visually ready. You can connect it later to your API or contact service.",
    },
  } as const;
  
  export default function FeedbackPage({ params }: PageProps) {
    const locale = params.locale === "en" ? "en" : "es";
    const t = content[locale];
  
    return (
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-[#493287] px-6 py-20 text-white sm:px-10 lg:px-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/footer/text.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto 36px",
            }}
          />
  
          <div className="relative z-10 mx-auto max-w-[1080px]">
            <p className="font-[var(--font-poppins)] text-[14px] font-bold uppercase tracking-[0.22em] text-white/80">
              {t.eyebrow}
            </p>
  
            <h1 className="mt-4 max-w-3xl font-[var(--font-poppins)] text-[42px] font-extrabold leading-tight sm:text-[54px]">
              {t.title}
            </h1>
  
            <p className="mt-5 max-w-2xl font-[var(--font-poppins)] text-[16px] font-medium leading-relaxed text-white/90 sm:text-[18px]">
              {t.description}
            </p>
          </div>
        </section>
  
        <section className="px-6 py-14 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-[760px] rounded-[24px] border border-[#493287]/15 bg-white p-6 shadow-[0_12px_35px_rgba(73,50,135,0.08)] sm:p-8">
            <h2 className="font-[var(--font-poppins)] text-[28px] font-extrabold text-[#493287]">
              {t.formTitle}
            </h2>
  
            <form className="mt-7 grid gap-5">
              <div>
                <label className="mb-2 block font-[var(--font-poppins)] text-[14px] font-bold text-[#493287]">
                  {t.name}
                </label>
  
                <input
                  type="text"
                  className="h-[46px] w-full rounded-[10px] border border-slate-200 px-4 font-[var(--font-poppins)] text-[15px] outline-none transition focus:border-[#493287]"
                />
              </div>
  
              <div>
                <label className="mb-2 block font-[var(--font-poppins)] text-[14px] font-bold text-[#493287]">
                  {t.email}
                </label>
  
                <input
                  type="email"
                  className="h-[46px] w-full rounded-[10px] border border-slate-200 px-4 font-[var(--font-poppins)] text-[15px] outline-none transition focus:border-[#493287]"
                />
              </div>
  
              <div>
                <label className="mb-2 block font-[var(--font-poppins)] text-[14px] font-bold text-[#493287]">
                  {t.message}
                </label>
  
                <textarea
                  rows={6}
                  className="w-full resize-none rounded-[10px] border border-slate-200 px-4 py-3 font-[var(--font-poppins)] text-[15px] outline-none transition focus:border-[#493287]"
                />
              </div>
  
              <button
                type="button"
                className="mt-2 inline-flex h-[46px] w-fit items-center justify-center rounded-[8px] bg-[#C028B9] px-6 font-[var(--font-poppins)] text-[14px] font-extrabold text-white transition hover:opacity-90"
              >
                {t.button}
              </button>
            </form>
  
            <p className="mt-5 font-[var(--font-poppins)] text-[13px] font-medium leading-relaxed text-slate-500">
              {t.note}
            </p>
          </div>
        </section>
      </main>
    );
  }