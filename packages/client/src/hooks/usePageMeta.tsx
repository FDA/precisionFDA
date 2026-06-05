import { useEffect } from 'react'
import { applyPageMeta, PAGE_META, type PageMetaInput } from '@/lib/pageMeta'

export type UsePageMetaOptions = PageMetaInput

export const usePageMeta = ({
  title = PAGE_META.defaultTitle,
  description = PAGE_META.defaultDescription,
  imagePath,
  url,
}: UsePageMetaOptions = {}) => {
  useEffect(() => {
    applyPageMeta({ title, description, imagePath, url })
  }, [title, description, imagePath, url])
}
