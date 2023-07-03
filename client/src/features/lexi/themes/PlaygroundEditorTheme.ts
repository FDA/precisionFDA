/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorThemeClasses } from 'lexical'

import './PlaygroundEditorTheme.css'

const theme: EditorThemeClasses = {
  blockCursor: 'PFDAEditorTheme__blockCursor',
  characterLimit: 'PFDAEditorTheme__characterLimit',
  code: 'PFDAEditorTheme__code',
  codeHighlight: {
    atrule: 'PFDAEditorTheme__tokenAttr',
    attr: 'PFDAEditorTheme__tokenAttr',
    boolean: 'PFDAEditorTheme__tokenProperty',
    builtin: 'PFDAEditorTheme__tokenSelector',
    cdata: 'PFDAEditorTheme__tokenComment',
    char: 'PFDAEditorTheme__tokenSelector',
    class: 'PFDAEditorTheme__tokenFunction',
    'class-name': 'PFDAEditorTheme__tokenFunction',
    comment: 'PFDAEditorTheme__tokenComment',
    constant: 'PFDAEditorTheme__tokenProperty',
    deleted: 'PFDAEditorTheme__tokenProperty',
    doctype: 'PFDAEditorTheme__tokenComment',
    entity: 'PFDAEditorTheme__tokenOperator',
    function: 'PFDAEditorTheme__tokenFunction',
    important: 'PFDAEditorTheme__tokenVariable',
    inserted: 'PFDAEditorTheme__tokenSelector',
    keyword: 'PFDAEditorTheme__tokenAttr',
    namespace: 'PFDAEditorTheme__tokenVariable',
    number: 'PFDAEditorTheme__tokenProperty',
    operator: 'PFDAEditorTheme__tokenOperator',
    prolog: 'PFDAEditorTheme__tokenComment',
    property: 'PFDAEditorTheme__tokenProperty',
    punctuation: 'PFDAEditorTheme__tokenPunctuation',
    regex: 'PFDAEditorTheme__tokenVariable',
    selector: 'PFDAEditorTheme__tokenSelector',
    string: 'PFDAEditorTheme__tokenSelector',
    symbol: 'PFDAEditorTheme__tokenProperty',
    tag: 'PFDAEditorTheme__tokenProperty',
    url: 'PFDAEditorTheme__tokenOperator',
    variable: 'PFDAEditorTheme__tokenVariable',
  },
  embedBlock: {
    base: 'PFDAEditorTheme__embedBlock',
    focus: 'PFDAEditorTheme__embedBlockFocus',
  },
  hashtag: 'PFDAEditorTheme__hashtag',
  heading: {
    h1: 'PFDAEditorTheme__h1',
    h2: 'PFDAEditorTheme__h2',
    h3: 'PFDAEditorTheme__h3',
    h4: 'PFDAEditorTheme__h4',
    h5: 'PFDAEditorTheme__h5',
    h6: 'PFDAEditorTheme__h6',
  },
  image: 'editor-image',
  indent: 'PFDAEditorTheme__indent',
  inlineImage: 'inline-editor-image',
  link: 'PFDAEditorTheme__link',
  list: {
    listitem: 'PFDAEditorTheme__listItem',
    listitemChecked: 'PFDAEditorTheme__listItemChecked',
    listitemUnchecked: 'PFDAEditorTheme__listItemUnchecked',
    nested: {
      listitem: 'PFDAEditorTheme__nestedListItem',
    },
    olDepth: [
      'PFDAEditorTheme__ol1',
      'PFDAEditorTheme__ol2',
      'PFDAEditorTheme__ol3',
      'PFDAEditorTheme__ol4',
      'PFDAEditorTheme__ol5',
    ],
    ul: 'PFDAEditorTheme__ul',
  },
  ltr: 'PFDAEditorTheme__ltr',
  mark: 'PFDAEditorTheme__mark',
  markOverlap: 'PFDAEditorTheme__markOverlap',
  paragraph: 'PFDAEditorTheme__paragraph',
  quote: 'PFDAEditorTheme__quote',
  rtl: 'PFDAEditorTheme__rtl',
  table: 'PFDAEditorTheme__table',
  tableAddColumns: 'PFDAEditorTheme__tableAddColumns',
  tableAddRows: 'PFDAEditorTheme__tableAddRows',
  tableCell: 'PFDAEditorTheme__tableCell',
  tableCellActionButton: 'PFDAEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer:
    'PFDAEditorTheme__tableCellActionButtonContainer',
  tableCellEditing: 'PFDAEditorTheme__tableCellEditing',
  tableCellHeader: 'PFDAEditorTheme__tableCellHeader',
  tableCellPrimarySelected: 'PFDAEditorTheme__tableCellPrimarySelected',
  tableCellResizer: 'PFDAEditorTheme__tableCellResizer',
  tableCellSelected: 'PFDAEditorTheme__tableCellSelected',
  tableCellSortedIndicator: 'PFDAEditorTheme__tableCellSortedIndicator',
  tableResizeRuler: 'PFDAEditorTheme__tableCellResizeRuler',
  tableSelected: 'PFDAEditorTheme__tableSelected',
  text: {
    bold: 'PFDAEditorTheme__textBold',
    code: 'PFDAEditorTheme__textCode',
    italic: 'PFDAEditorTheme__textItalic',
    strikethrough: 'PFDAEditorTheme__textStrikethrough',
    subscript: 'PFDAEditorTheme__textSubscript',
    superscript: 'PFDAEditorTheme__textSuperscript',
    underline: 'PFDAEditorTheme__textUnderline',
    underlineStrikethrough: 'PFDAEditorTheme__textUnderlineStrikethrough',
  },
}

export default theme
