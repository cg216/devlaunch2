import { getArticle } from "@/lib/content"; import MDX from "@/lib/mdx"; import JsonLd from "@/components/JsonLd";
export default function Page({params}){ const {slug}=params; const a=getArticle(slug); if(!a) return <div>Not found</div>;
  const jsonld={"@context":"https://schema.org","@type":"Article","headline":a.meta.title,"inLanguage":"en","isAccessibleForFree":true};
  return (<><JsonLd data={jsonld}/><article><MDX source={a.body}/></article></>); }