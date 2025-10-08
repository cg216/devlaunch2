import { listArticles } from "@/lib/content"; export default function robots(){
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  const live=listArticles().filter(a=>!a.noindex);
  return { rules:[ {userAgent:"*", allow:"/"}, ...(live.length?[]:[{userAgent:"*", disallow:"/"}]) ], sitemap: base+"/sitemap.xml" }; }