import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import remarkCallout from "@r4ai/remark-callout"
import rehypeRaw from 'rehype-raw'

export const { docs, meta } = defineDocs({
  dir: ['content/docs'],
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkCallout],
    // rehypePlugins: [rehypeRaw],
  }
})
