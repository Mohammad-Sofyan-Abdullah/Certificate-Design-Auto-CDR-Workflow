import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spectrum - School Leaving Certificate Generator',
  description: 'Generate School Leaving Certificates for Spectrum The Schooling Zone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
