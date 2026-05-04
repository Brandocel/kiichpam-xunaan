// src/features/contact/components/ContactHero.tsx

interface ContactHeroProps {
    image?: string;
  }
  
  export default function ContactHero({
    image = "/contacto/hero.png",
  }: ContactHeroProps) {
    return (
      <section className="relative h-[551px] w-full overflow-hidden">
        <img
          src={image}
          alt="Contacto Kiichpam Xunaan"
          className="absolute inset-0 h-full w-full object-cover"
        />
  
        <div className="absolute inset-0 bg-black/55" />
  
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(139,0,142,0.72)_0%,rgba(139,0,142,0.45)_16%,rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.58)_100%)]" />
      </section>
    );
  }