import { $generateHtmlFromNodes } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Loader } from '../../../components/Loader'
import { BackLink } from '../../../components/Page/PageBackLink'
import { LexiContext } from '../../lexi'
import Editor from '../../lexi/Editor'
import { CreateDataPortalRequest, updateDataPortalRequest } from '../api'
import { useDataPortalByIdQuery } from '../queries'
import { DataPortal } from '../types'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { useAuthUser } from '../../auth/useAuthUser'
import { canEditContent } from '../utils'
import { Button } from '../../../components/Button'

const ContentEditButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 12px;
  max-width: 1000px;
`

const SubmitRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  align-items: center;
`

const TopBar = ({ portalId, data }: { portalId: string | number, data: DataPortal }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['update-data-portal'],
    mutationFn: (payload: Pick<CreateDataPortalRequest, 'content' | 'editor_state'>) => updateDataPortalRequest(payload, portalId),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['data-portals', portalId.toString()])
      navigate(`/data-portals/${portalId}`)
      toast.success('Data Portal content updated')
    },
  })
  const [editor] = useLexicalComposerContext()
  const handleSave = () => {
    editor.update(() => {
      const editorState = editor.getEditorState()
      const jsonString = JSON.stringify(editorState)
      const htmlString = $generateHtmlFromNodes(editor, null)
      mutation.mutateAsync({ content: htmlString, editor_state: jsonString })
    })
  }
  return (
    <ContentEditButtonRow>
      <BackLink linkTo={`/data-portals/${portalId}`}>Back to Portal</BackLink>
      <SubmitRow>
        {mutation.isLoading && <Loader />}
        <Button variant="primary" disabled={mutation.isLoading} onClick={() => handleSave()}>Save</Button>
      </SubmitRow>
    </ContentEditButtonRow>
  )
}

export default function DataPortalContentEditPage(): JSX.Element {
  const user = useAuthUser()
  const { portalId } = useParams<{
    portalId: string
    page?: string
  }>()
  const { data, isLoading } = useDataPortalByIdQuery(portalId)
  if(isLoading) return <Loader />
  if(!canEditContent(user?.dxuser, data?.members)) {
    return <NotAllowedPage />
  }
  
  return (
    <LexiContext editorState={data?.editorState}>
      <div className="editor-shell">
        <TopBar portalId={data!.id} data={data} />
        <Editor/>
      </div>
    </LexiContext>
  )
}
