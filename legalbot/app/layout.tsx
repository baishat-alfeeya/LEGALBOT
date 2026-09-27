import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LEGALBOT - AI Legal Assistance",
  description: "AI-powered legal assistance for every Indian",
};

const langResetScript = `
(function(){
  try {
    var VERSION = "2";
    var stored = localStorage.getItem("legalbot-lang-version");
    if (stored !== VERSION) {
      localStorage.removeItem("legalbot-lang");
      localStorage.setItem("legalbot-lang-version", VERSION);
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: langResetScript }} />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <AuthProvider>
          <LanguageProvider>
            {/* ConditionalNavbar hides itself on /login, /signup, /forgot-password */}
            <ConditionalNavbar />
            <main>{children}</main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
