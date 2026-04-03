import { notFound } from 'next/navigation';

interface Props {
  params: { locale: string; slug: string };
}

export default async function BlogPostPage({ params }: Props) {
  // Temporal - para que compile
  return (
    <div className="min-h-screen pt-20">
      <h1>Blog Post: {params.slug}</h1>
      <p>Esta página está en desarrollo...</p>
    </div>
  );
}