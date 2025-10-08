import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getTenantPack } from "@/lib/pack";

export const metadata = {
  title: { default: "DevLaunch Site", template: "%s • DevLaunch" },
  description: "Auto-generated, QC-gated content"
};

export default function RootLayout({ children }) {
  const pack = getTenantPack();
  const palette = pack?.brand?.palette || {};
  return (
    <html lang="en">
      <body
        style={{
          // Brand variables
          "--brand-primary": palette.primary || "#0ea5e9",
          "--brand-ink":     palette.ink     || "#0f172a",
          "--brand-muted":   palette.muted   || "#94a3b8",
          "--brand-bg":      palette.bg      || "#ffffff"
        }}
        className="bg-[var(--brand-bg)] text-[var(--brand-ink)]"
      >
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
