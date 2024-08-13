import { $generateHtmlFromNodes } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { NotAllowedPage } from '../../../components/NotAllowed'
import { useAuthUser } from '../../auth/useAuthUser'
import { LexiContext } from '../../lexi'
import Editor from '../../lexi/Editor'
import { UpdateDataPortalRequest, updateDataPortalRequest } from '../api'
import { useDataPortalByIdQuery } from '../queries'
import { DataPortal } from '../types'
import { canEditContent } from '../utils'

const ContentEditButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 12px;
  position: sticky;
  bottom: 16px;

  ${Button} {
    filter: drop-shadow(-7px 2px 7px rgba(112, 112, 112, 0.6));
    &:hover {
      filter: drop-shadow(-7px 2px 7px rgba(112, 112, 112, 0.6));
    }
  }
`

const SubmitRow = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  align-items: center;
`


const ButtonBar = ({ data }: { data: DataPortal }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['update-data-portal'],
    mutationFn: (payload: UpdateDataPortalRequest) => updateDataPortalRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['data-portals', data.urlSlug],
      })
      navigate(`/data-portals/${data.urlSlug}`)
      toast.success('Data Portal content updated')
    },
  })
  const [editor] = useLexicalComposerContext()
  const handleSave = () => {
    editor.update(() => {
      const editorState = editor.getEditorState()
      const jsonString = JSON.stringify(editorState)
      const htmlString = $generateHtmlFromNodes(editor, null)
      mutation.mutateAsync({
        id: data.id,
        content: htmlString,
        editor_state: jsonString,
      })
    })
  }
  const handleCancel = () => {
    navigate(`/data-portals/${data.urlSlug}`)
  }
  return (
    <ContentEditButtonRow>
      <SubmitRow>
        {mutation.isPending && <Loader />}
        <Button disabled={mutation.isPending} onClick={() => handleCancel()}>
          Cancel
        </Button>
        <Button data-variant="primary" disabled={mutation.isPending} onClick={() => handleSave()}>
          Save
        </Button>
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

  if (portalId === undefined) throw new Error('No portalId provided')

  const { data, isLoading } = useDataPortalByIdQuery(portalId)

  if (isLoading) return <Loader />

  if (!canEditContent(user?.dxuser, data?.members)) {
    return <NotAllowedPage />
  }

  return (
    <LexiContext editorState={data?.editorState}>
      {portalId && data && (
        <div className="editor-shell">
          <Editor />
          <ButtonBar data={data} />
        </div>
      )}
    </LexiContext>
  )
}
