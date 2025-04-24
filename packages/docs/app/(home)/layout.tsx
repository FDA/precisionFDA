import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { type ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/app/source';
import { getBaseUrlFromHeaders } from '@/lib/getBaseUrlFromHeaders'

export default async function Layout({ children }: { children: ReactNode }) {
  const baseUrl = await getBaseUrlFromHeaders()
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions} nav={{ ...baseOptions.nav, url: baseUrl }} >
      {children}
    </DocsLayout>
  );
}
