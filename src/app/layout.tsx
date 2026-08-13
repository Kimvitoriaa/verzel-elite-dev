import type { Metadata } from 'next';
import './globals.css';
import AccessibilityBar from '@/components/AccessibilityBar';

export const metadata: Metadata = {
  title: 'Verzel Elite Dev - Festival',
  description: 'Sistema de gestão de eventos e ingressos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white min-h-screen antialiased">
        <AccessibilityBar />
        {children}
      </body>
    </html>
  );
}