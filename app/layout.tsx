import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Belén va a perder',
  description: 'Marcador del reto GeoGuessr Daily Challenge',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
