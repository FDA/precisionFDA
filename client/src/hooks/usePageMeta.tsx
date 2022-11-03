import { useEffect } from 'react'

const defaultDscription =
  'Advancing regulatory standards for bioinformatics, RWD, and AI, through community-sourced science.'

export const usePageMeta = ({
  title = 'PFDA',
  description = defaultDscription,
}: {
  title?: string
  description?: string
}) => {
  useEffect(() => {
    if (document) {
      document.title = title
      document.querySelector("meta[name='description']")?.setAttribute('content', description)
    }
  }, [title, description])
}
