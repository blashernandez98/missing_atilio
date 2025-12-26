'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if admin panel is enabled
    const isAdminEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';

    if (!isAdminEnabled) {
      // Redirect to 404 if admin is not enabled
      router.push('/404');
    }
  }, [router]);

  // Only render if admin is enabled
  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== 'true') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-950 border-b border-slate-700 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-50">
            🏆 Missing Atilio - Panel de Administración
          </h1>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-all"
          >
            ← Volver al Juego
          </a>
        </div>
      </header>
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}
