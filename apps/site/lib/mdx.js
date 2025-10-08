import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import Quiz from "@/components/Quiz";
import FAQ from "@/components/FAQ";
import Calculator from "@/components/Calculator";
import KeyTakeaways from "@/components/KeyTakeaways";
import ComparisonTable from "@/components/ComparisonTable";
import Callout from "@/components/Callout";

const components = { Quiz, FAQ, Calculator, KeyTakeaways, ComparisonTable, Callout };

export default function MDX({ source }) {
  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
        },
      }}
      components={components}
    />
  );
}
