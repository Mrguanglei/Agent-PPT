import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPT Agent - AI-Powered Presentation Creator',
  description: 'Create professional PowerPoint presentations with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
