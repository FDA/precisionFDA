/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $createLinkNode } from '@lexical/link'
import { $createListItemNode, $createListNode } from '@lexical/list'
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import * as React from 'react'

import { SettingsContext } from './context/SettingsContext'
import PlaygroundNodes from './nodes/PlaygroundNodes'
import { TableContext } from './plugins/TablePlugin'
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme'

import './index.css'
import './setupEnv'



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
      <LexicalComposer initialConfig={initialConfig}>
        <TableContext>{children}</TableContext>
      </LexicalComposer>
    </SettingsContext>
  )
}

