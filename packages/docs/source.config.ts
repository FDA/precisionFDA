import remarkCallout from '@r4ai/remark-callout'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import type { Pluggable } from 'unified'

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkCallout as Pluggable],
  },
})
