import React from 'react'
import { useNavigate } from 'react-router-dom'
import { $generateHtmlFromNodes } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { LexiContext } from '../../lexi'
import Editor from '../../lexi/Editor'
import { useChallengeByIDQuery } from '../useChallengeDetailsQuery'
import { Button } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { ContentType, UpdateChallengeContent, updateChallengeContentRequest } from '../api'

const SubmitRow = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  align-items: center;
`

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

const ButtonBar = ({
  challengeId,
  contentType,
}: {
  challengeId: number | string
  contentType: UpdateChallengeContent['type']
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['update-challenge'],
    mutationFn: (payload: UpdateChallengeContent) => updateChallengeContentRequest(challengeId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['challenges', challengeId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['challenge', challengeId, contentType],
      })
      toast.success('Challenge content updated')
    },
  })
  const [editor] = useLexicalComposerContext()
  const handleSave = () => {
    editor.update(() => {
      const editorState = editor.getEditorState()
      const jsonString = JSON.stringify(editorState)
      const htmlString = $generateHtmlFromNodes(editor, null)
      mutation.mutateAsync({
        content: htmlString,
        editorState: jsonString,
        type: contentType,
      })
    })
  }
  const handleCancel = () => {
    navigate(`/challenges/${challengeId}`)
  }
  return (
    <ContentEditButtonRow>
      <SubmitRow>
        {mutation.isPending && <Loader />}
        <Button disabled={mutation.isPending} onClick={() => handleCancel()}>
          Cancel
        </Button>
        <Button data-variant="primary" disabled={mutation.isPending} onClick={() => handleSave()}>
          Save {contentType}
        </Button>
      </SubmitRow>
    </ContentEditButtonRow>
  )
}

const mapContentTypeToKey = (contentType: UpdateChallengeContent['type']) => {
  switch (contentType) {
    case 'info':
      return 'infoEditorState'
    case 'results':
      return 'resultsEditorState'
    case 'pre-registration':
      return 'preRegistrationEditorState'
    default:
      return 'infoEditorState'
  }
}

const ScrollBody = styled.div`
  overflow-y: auto;
  line-height: 1.7;
`

export const ContentTypePage = ({ challengeId, contentType }: { challengeId: number | string; contentType: ContentType }) => {
  const { data } = useChallengeByIDQuery(challengeId!, contentType)
  if (!data) return null
  return (
    <LexiContext editorState={data[mapContentTypeToKey(contentType)]}>
      <ScrollBody className="editor-shell" style={{ margin: 0 }}>
        <Editor insertImageType="uri" />
        <ButtonBar challengeId={challengeId!} contentType={contentType!} />
      </ScrollBody>
    </LexiContext>
  )
}
