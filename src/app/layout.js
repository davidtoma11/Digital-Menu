import { Fraunces, Inter, Noto_Serif, Roboto, Roboto_Slab } from 'next/font/google';
import "./globals.css";

// Meniul public: Fraunces (titluri, prețuri) + Inter (text).
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz', 'SOFT'],
  variable: '--font-display',
  display: 'swap',
});

// Fraunces nu are litere grecești: pentru ele folosim Noto Serif (doar subsetul grecesc).
const notoSerifGreek = Noto_Serif({
  subsets: ['greek'],
  variable: '--font-display-greek',
  display: 'swap',
  preload: false,
});

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'greek'],
  variable: '--font-text',
  display: 'swap',
});

// Folosite încă de Studio poze (adminPanel).
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-roboto',
  display: 'swap',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['500', '800'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://la-zavat-menu.vercel.app'),
  title: "Taverna La Zavat — Meniu",
  description: "Bucătărie grecească & fructe de mare. Meniul Tavernei La Zavat, în română, engleză și greacă.",
  openGraph: {
    title: 'Taverna La Zavat — Meniu',
    description: 'Bucătărie grecească & fructe de mare',
    siteName: 'Taverna La Zavat',
    locale: 'ro_RO',
    type: 'website',
  },
  appleWebApp: { title: 'La Zavat', statusBarStyle: 'default' },
};

// Telefon: bara browserului în culoarea hârtiei, conținut până sub notch.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6efe4',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className={`${fraunces.variable} ${notoSerifGreek.variable} ${inter.variable} ${roboto.variable} ${robotoSlab.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
