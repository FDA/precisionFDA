/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
} from 'lexical'
import * as React from 'react'
import { useEffect, useState } from 'react'

import useModal from '../../hooks/useModal'
import Button from '../../ui/Button'


export default function ActionsPlugin({
  isRichText,
}: {
  isRichText: boolean;
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [isEditable, setIsEditable] = useState(() => editor.isEditable())
  const [isEditorEmpty, setIsEditorEmpty] = useState(true)
  const [modal, showModal] = useModal()

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable)
      }),
    )
  }, [editor])

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ dirtyElements, prevEditorState, tags }) => {
        editor.getEditorState().read(() => {
          const root = $getRoot()
          const children = root.getChildren()

          if (children.length > 1) {
            setIsEditorEmpty(false)
          } else if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren()
              setIsEditorEmpty(paragraphChildren.length === 0)
            } else {
              setIsEditorEmpty(false)
            }
        })
      },
    )
  }, [editor, isEditable])

  return (
    <div className="actions">
      <button
        className="action-button clear"
        disabled={isEditorEmpty}
        onClick={() => {
          showModal('Clear editor', (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
          ))
        }}
        title="Clear"
        aria-label="Clear editor contents">
        <i className="clear" />
      </button>
      {modal}
    </div>
  )
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            editor.focus()
            onClose()
          }}>
          Clear
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus()
            onClose()
          }}>
          Cancel
        </Button>
      </div>
    </>
  )
}
