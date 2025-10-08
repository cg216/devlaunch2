import { listArticles } from "@/lib/content"; import Link from "next/link"; export const dynamic="force-dynamic";
export default function Home(){ const articles=listArticles(); const live=articles.filter(a=>!a.noindex); const drafts=articles.filter(a=>a.noindex);
  return (<main><h1>Site Index</h1><h2>Published</h2><ul>{live.map(a=><li key={a.slug}><Link href={"/articles/"+a.slug}>{a.title}</Link></li>)}</ul>
    <h2 style={{marginTop:24}}>Drafts (noindex)</h2><ul>{drafts.map(a=><li key={a.slug}><Link href={"/articles/"+a.slug}>{a.title}</Link></li>)}</ul></main>); }