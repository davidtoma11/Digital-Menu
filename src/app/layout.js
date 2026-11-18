import { Roboto, Roboto_Slab, Merriweather } from 'next/font/google';
import "./globals.css";


const roboto = Roboto({
  subsets: ['latin'],
  weight: ['200', '400', '700', '800'], 
  style: ['normal', 'italic'],
  variable: '--font-roboto',
  display: 'swap',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['500', '800'], 
  style: ['normal'],
  variable: '--font-roboto-slab',
  display: 'swap',
});


const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['900'],
  style: ['normal'],
  variable: '--font-merriweather',
  display: 'swap',
});

export const metadata = {
  title: "Taverna La Zavat - Meniu",
  description: "Meniul digital Taverna La Zavat",
};

// Telefon: bara browserului în culoarea meniului, conținut până sub notch.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#94704f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={`${roboto.variable} ${robotoSlab.variable} ${merriweather.variable}`}>
        {children}
      </body>
    </html>
  );
}