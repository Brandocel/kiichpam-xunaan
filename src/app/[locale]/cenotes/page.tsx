// src/app/[locale]/cenotes/page.tsx
import { notFound } from 'next/navigation';

interface Props {
  params: { locale: string };
}

export default async function CenotesPage({ params }: Props) {
  // Página temporal mientras desarrollas la sección de cenotes
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center mb-6">
          Nuestros Cenotes
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Descubre los cenotes más impresionantes de la Riviera Maya
        </p>

        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
          <p className="text-2xl mb-4">🌊 Esta sección está en desarrollo</p>
          <p className="text-gray-500">
            Pronto podrás explorar todos nuestros cenotes aquí.
          </p>
        </div>
      </div>
    </div>
  );
}