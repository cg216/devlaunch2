import "./globals.css";
import { getTenantPack } from "@/lib/pack";
import AdSlot from "@/components/AdSlot";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "DevLaunch Site", template: "%s • DevLaunch" },
  description: "Auto-generated, QC-gated content"
};

export default function RootLayout({ children }) {
  const pack = getTenantPack();
  const palette = pack?.brand?.palette || { bg: "#ffffff", ink: "#0f172a" };
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", color: palette.ink, background: palette.bg, lineHeight: 1.6, padding: 24 }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>{pack?.tenant?.displayName || "Site"}</h1>
          {/* Example top ad — will render only when pack.ads.enabled && pack.ads.placements.top === true */}
          <AdSlot id="top" pack={pack} />
        </header>
        {children}
      </body>
    </html>
  );
}
