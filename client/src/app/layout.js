import { Montserrat } from "next/font/google";
import "./globals.css";


const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});


export const metadata = {
  title: "Sadap clinic",
  description: "",
};

export const viewport = {
  width: "device-width",
  // initialScale: 0.25,
  // minimumScale: 0.1,
  initialScale:1, 
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
