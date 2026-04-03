// src/app/[locale]/blog/page.tsx
import { notFound } from 'next/navigation';

interface Props {
  params: { locale: string };
}

export default async function BlogPage({ params }: Props) {
  // Página temporal mientras desarrollas el blog
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Blog</h1>
        <p className="text-lg text-gray-600 mb-8">
          Pronto encontrarás aquí todas nuestras historias, noticias y experiencias en los cenotes.
        </p>
        
        <div className="bg-gray-100 rounded-2xl p-12 text-center">
          <p className="text-xl">🚧 Esta sección está en desarrollo</p>
        </div>
      </div>
    </div>
  );
}