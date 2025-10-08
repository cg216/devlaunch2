import { listArticles } from "@/lib/content"; export default function sitemap(){
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  return listArticles().filter(a=>!a.noindex).map(a=>({url:base+"/articles/"+a.slug,lastModified:new Date()})); }