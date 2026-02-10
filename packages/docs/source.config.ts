import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import remarkCallout from "@r4ai/remark-callout"
import type { Pluggable } from 'unified'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkCallout as Pluggable],
    // rehypePlugins: [rehypeRaw],
  }
})
