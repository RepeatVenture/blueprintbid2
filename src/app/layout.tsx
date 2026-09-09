import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "BlueprintBid | Evidence-first millwork estimating",
    template: "%s | BlueprintBid",
  },
  description:
    "Review the scope. Understand the cost. Build a millwork bid you can stand behind.",
  openGraph: {
    title: "BlueprintBid",
    description: "Millwork estimating with evidence and estimator control.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brand-icon">B</span> Blueprint<span>Bid</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/#workflow">Workflow</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/login">Sign in</Link>
            <Link className="button small" href="/demo">
              Explore demo ↗
            </Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <Link className="brand" href="/">
            BlueprintBid
          </Link>
          <span>Built for the people who build it.</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </footer>
      </body>
    </html>
  );
}
