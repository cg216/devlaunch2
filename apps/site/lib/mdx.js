import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolink from "rehype-autolink-headings";
import Calculator from "@/components/Calculator";
import Quiz from "@/components/Quiz";
import Chart from "@/components/Chart";
export default function MDX({ source }) {
  return (
    <MDXRemote
      source={source}
      components={{ Calculator, Quiz, Chart }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypeSlug], [rehypeAutolink, { behavior: "wrap" }]]
        }
      }}
    />
  );
}