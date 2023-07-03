/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import useLexicalEditable from '@lexical/react/useLexicalEditable'
import * as React from 'react'
import { useEffect, useState } from 'react'

import { useSettings } from './context/SettingsContext'
import { useSharedHistoryContext } from './context/SharedHistoryContext'
import { CAN_USE_DOM } from './environment'
import TableCellNodes from './nodes/TableCellNodes'
import ActionsPlugin from './plugins/ActionsPlugin'
import AutoLinkPlugin from './plugins/AutoLinkPlugin'
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'

import ComponentPickerPlugin from './plugins/ComponentPickerPlugin'
import ContextMenuPlugin from './plugins/ContextMenuPlugin'
import DragDropPaste from './plugins/DragDropPastePlugin'
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin'
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin'
import ImagesPlugin from './plugins/ImagesPlugin'
import InlineImagePlugin from './plugins/InlineImagePlugin'
import LinkPlugin from './plugins/LinkPlugin'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin'
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin'
import TabFocusPlugin from './plugins/TabFocusPlugin'
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin'
import TableCellResizer from './plugins/TableCellResizer'
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin'
import { TablePlugin as NewTablePlugin } from './plugins/TablePlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import TreeViewPlugin from './plugins/TreeViewPlugin'
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme'
import ContentEditable from './ui/ContentEditable'
import Placeholder from './ui/Placeholder'

const skipCollaborationInit =
  // @ts-ignore
  window.parent != null && window.parent.frames.right === window

export default function Editor(): JSX.Element {
  const { historyState } = useSharedHistoryContext()
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings()
  const isEditable = useLexicalEditable()
  const text = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
    ? 'Enter some rich text...'
    : 'Enter some plain text...'
  const placeholder = <Placeholder>{text}</Placeholder>
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  const cellEditorConfig = {
    namespace: 'Playground',
    nodes: [...TableCellNodes],
    onError: (error: Error) => {
      throw error
    },
    theme: PlaygroundEditorTheme,
  }

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport)
      }
    }
    updateViewPortWidth()
    window.addEventListener('resize', updateViewPortWidth)

    return () => {
      window.removeEventListener('resize', updateViewPortWidth)
    }
  }, [isSmallWidthViewport])

  return (
    <>
      {isRichText && <ToolbarPlugin />}
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
          !isRichText ? 'plain-text' : ''
        }`}
      >
        {isMaxLength && <MaxLengthPlugin maxLength={30} />}
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <AutoLinkPlugin />

        <HistoryPlugin externalHistoryState={historyState} />
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor" ref={onRef}>
                <ContentEditable />
              </div>
            </div>
          }
          placeholder={placeholder}
          ErrorBoundary={LexicalErrorBoundary}
        />

        <CodeHighlightPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <TablePlugin
          hasCellMerge={tableCellMerge}
          hasCellBackgroundColor={tableCellBackgroundColor}
        />
        <TableCellResizer />
        <NewTablePlugin cellEditorConfig={cellEditorConfig}>
          <AutoFocusPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="TableNode__contentEditable" />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ImagesPlugin captionsEnabled={false} />
          <LinkPlugin />
          <LexicalClickableLinkPlugin />
          <FloatingTextFormatToolbarPlugin />
        </NewTablePlugin>
        <ImagesPlugin />
        <InlineImagePlugin />
        <LinkPlugin />
        {!isEditable && <LexicalClickableLinkPlugin />}
        <HorizontalRulePlugin />
        <TabFocusPlugin />
        <TabIndentationPlugin />

        {floatingAnchorElem && !isSmallWidthViewport && (
          <>
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
            <TableCellActionMenuPlugin
              anchorElem={floatingAnchorElem}
              cellMerge
            />
            <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
        <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
        {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
        {/* <ActionsPlugin isRichText={isRichText} /> */}
      </div>
      {showTreeView && <TreeViewPlugin />}
    </>
  )
}
