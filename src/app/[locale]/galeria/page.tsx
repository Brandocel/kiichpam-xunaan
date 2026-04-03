// src/app/[locale]/contacto/page.tsx
import Header from '@/shared/components/layout/Header';

interface Props {
  params: { locale: string };
}

export default function ContactoPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={params.locale as "es" | "en"} />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Contáctanos</h1>
          <p className="text-xl text-gray-600 mb-12">
            Estamos aquí para ayudarte a planificar tu experiencia inolvidable
          </p>

          <div className="bg-white rounded-3xl p-12 shadow-sm max-w-2xl mx-auto">
            <p className="text-2xl mb-8">📍 Esta página de contacto está en desarrollo</p>
            
            <div className="space-y-4 text-left text-gray-600">
              <p><strong>Email:</strong> info@kiichpamxunaan.com</p>
              <p><strong>Teléfono:</strong> +52 984 123 4567</p>
              <p><strong>WhatsApp:</strong> +52 984 123 4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}