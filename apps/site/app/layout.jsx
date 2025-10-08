export const metadata={ metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"),
  title:{default:"DevLaunch Site",template:"%s • DevLaunch"}, description:"Auto-generated, QC-gated content" };
export default function RootLayout({children}){ return (<html lang="en"><body style={{fontFamily:"system-ui, sans-serif",color:"#0f172a",lineHeight:1.6,padding:24}}>
  {children}</body></html>); }