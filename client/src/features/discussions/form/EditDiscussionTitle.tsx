import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useRef } from 'react'
import styled from 'styled-components'
import { Button, ButtonSolidBlue } from '../../../components/Button'
import { editDiscussionRequest } from '../api'
import { Discussion } from '../discussions.types'
import { InputText } from '../../../components/InputText'


export const StyledTitleEdit = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;

  ${InputText} {
    max-width: 300px;
    height: 36px;
    padding: 0 8px;
  }
`

export function EditDiscussionTitle({
  discussionId,
  defaultValue,
  setIsEditing,
}: {
  discussionId: number
  defaultValue: string
  setIsEditing: (v: boolean) => void
}) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const editTitleMutation = useMutation({
    mutationKey: ['discussion-edit'],
    mutationFn: (payload: { title: string; id: number }) => {
      return editDiscussionRequest(discussionId, payload)
    },
    async onMutate({ title }) {
      await queryClient.cancelQueries(['discussion', { id: discussionId }])
      const prevDiscu = await queryClient.getQueryData<Discussion>([
        'discussion',
        { id: discussionId },
      ])
      let newDiscu
      if (prevDiscu) {
        newDiscu = { ...prevDiscu }
        newDiscu.note.title = title
      }

      queryClient.setQueryData(['discussion', { id: discussionId }], newDiscu)
      setIsEditing(false)
      return { prevDiscu }
    },
    onError(_1, _2, ctx) {
      if (ctx?.prevDiscu) {
        queryClient.setQueryData(
          ['discussion', { id: discussionId }],
          ctx.prevDiscu,
        )
      }
    },
    onSettled() {
      queryClient.invalidateQueries(['discussion', { id: discussionId }])
    },
  })
  return (
    <StyledTitleEdit>
      <InputText
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        disabled={editTitleMutation.isLoading}
      />
      <Button
        disabled={editTitleMutation.isLoading}
        type="button"
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
      <ButtonSolidBlue
        type="button"
        onClick={() =>
          inputRef.current?.value &&
          editTitleMutation.mutate({
            title: inputRef?.current?.value,
            id:
              typeof discussionId === 'string'
                ? parseInt(discussionId, 10)
                : discussionId,
          })
        }
        disabled={editTitleMutation.isLoading}
      >
        Save
      </ButtonSolidBlue>
    </StyledTitleEdit>
  )
}
