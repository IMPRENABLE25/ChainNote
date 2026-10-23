import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "ChainNote — Une preuve, sur la chaîne", description: "Publiez et vérifiez une preuve horodatée sur BNB Smart Chain Testnet." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body><Providers>{children}</Providers></body></html>; }
