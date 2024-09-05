import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer'
import * as React from 'react'

import { FlashMessageContext } from './context/FlashMessageContext'
import { SettingsContext } from './context/SettingsContext'
import PlaygroundNodes from './nodes/PlaygroundNodes'
import { TableContext } from './plugins/TablePlugin'
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme'

import './setupEnv'
import './index.css'

export function LexiContext({ children, editorState }: any): JSX.Element {
  const initialConfig = {
    namespace: 'PFDA',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      // throw error
      console.error(error);
      
    },
    theme: PlaygroundEditorTheme,
    editorState,
  } satisfies InitialConfigType

  return (
    <SettingsContext>
      <FlashMessageContext>
        <LexicalComposer initialConfig={initialConfig}>
          <TableContext>{children}</TableContext>
        </LexicalComposer>
      </FlashMessageContext>
    </SettingsContext>
  )
}

