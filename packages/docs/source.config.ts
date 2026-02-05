import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import remarkCallout from "@r4ai/remark-callout"

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkCallout],
    // rehypePlugins: [rehypeRaw],
  }
})
