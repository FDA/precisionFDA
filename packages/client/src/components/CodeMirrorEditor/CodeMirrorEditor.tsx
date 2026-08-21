import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { yaml } from '@codemirror/lang-yaml'
import { indentUnit, StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import CodeMirror, {
  EditorView,
  type PanelConstructor,
  type ReactCodeMirrorProps,
  showPanel,
  type ViewUpdate,
} from '@uiw/react-codemirror'
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { cn } from '@/utils/cn'
import { useTheme } from '@/utils/ThemeContext'

type CodeMirrorEditorLanguage = 'cwl' | 'json' | 'markdown' | 'shell' | string

type MonacoCompatibleOptions = {
  minimap?: {
    enabled?: boolean
  }
  padding?: {
    top?: number
    bottom?: number
  }
}

type CodeMirrorEditorProps = Omit<ReactCodeMirrorProps, 'defaultValue' | 'onChange' | 'theme'> & {
  defaultLanguage?: CodeMirrorEditorLanguage
  defaultValue?: string
  formatDocument?: boolean
  language?: CodeMirrorEditorLanguage
  onChange?: (value?: string, event?: ViewUpdate) => void
  options?: MonacoCompatibleOptions
  topPanel?: PanelConstructor
}

const hideFocusOutline = EditorView.theme({
  '&.cm-focused': {
    outline: 'none !important',
  },
})

const EditorContainer = styled.div<{ $width?: string | number }>`
  width: ${({ $width }) => $width ?? '100%'};
  max-width: 100%;
`

// overrides CodeMirror's built-in light/dark panel colors and borders (e.g. oneDark's hardcoded 2px black) with the app's theme
const editorPanelsTheme = EditorView.theme({
  '.cm-panels': {
    display: 'block !important',
    flex: 'none',
    backgroundColor: 'var(--c-codemirror-bg) !important',
    color: 'var(--c-text-700) !important',
    zIndex: 1,
  },
  '.cm-panels-top': {
    borderBottom: '1px solid var(--c-layout-border) !important',
  },
  '.cm-panels-bottom': {
    borderTop: '1px solid var(--c-layout-border) !important',
  },
  '.cm-panel': {
    display: 'flex !important',
    boxSizing: 'border-box',
    width: '100%',
  },
  '.cm-panel.cm-editor-status-bar': {
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '4px 8px',
    fontSize: '12px',
    lineHeight: '16px',
  },
  '.cm-panel.cm-editor-toolbar': {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: '32px',
    padding: '4px',
  },
})

const getLanguageExtension = (language?: CodeMirrorEditorLanguage) => {
  switch (language) {
    case 'cwl':
      return yaml()
    case 'json':
      return json()
    case 'markdown':
      return markdown()
    case 'shell':
      return StreamLanguage.define(shell)
    default:
      return []
  }
}

const normalizeLineEndings = (value: string) => value.replace(/\r\n|\r|\n/g, '\n')

const formatValue = (value: string, language?: CodeMirrorEditorLanguage, shouldFormat?: boolean) => {
  if (!shouldFormat || language !== 'json') {
    return value
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const createStatusPanel =
  (language?: CodeMirrorEditorLanguage): PanelConstructor =>
  view => {
    const dom = document.createElement('div')
    dom.className = 'cm-editor-status-bar'

    const render = () => {
      const { main } = view.state.selection
      const line = view.state.doc.lineAt(main.head)
      const selectionLength = Math.abs(main.to - main.from)
      const status = [
        `Ln ${line.number}, Col ${main.head - line.from + 1}`,
        ...(selectionLength > 0 ? [`Selected ${selectionLength}`] : []),
        `${view.state.doc.lines} lines`,
        'Spaces: 2',
        ...(language ? [language] : []),
      ]

      dom.replaceChildren(
        ...status.map(item => {
          const span = document.createElement('span')
          span.textContent = item
          return span
        }),
      )
    }

    render()

    return {
      dom,
      update: update => {
        if (update.docChanged || update.selectionSet) {
          render()
        }
      },
    }
  }

const CodeMirrorEditor = ({
  className,
  defaultLanguage,
  defaultValue = '',
  extensions = [],
  formatDocument,
  language,
  onChange,
  onUpdate,
  options,
  topPanel,
  value,
  ...props
}: CodeMirrorEditorProps) => {
  const { resolvedTheme } = useTheme()
  const editorLanguage = language ?? defaultLanguage
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    formatValue(defaultValue, editorLanguage, formatDocument),
  )
  // stable reference so CodeMirror doesn't tear down and remount the panel on every render
  const statusPanel = useMemo(() => createStatusPanel(editorLanguage), [editorLanguage])
  const editorValue = formatValue(isControlled ? value : uncontrolledValue, editorLanguage, formatDocument)

  const padding = options?.padding
    ? {
        paddingBottom: options.padding.bottom,
        paddingTop: options.padding.top,
      }
    : undefined

  const handleChange = (newValue: string, event: ViewUpdate) => {
    const normalizedValue = normalizeLineEndings(newValue)

    if (!isControlled) {
      setUncontrolledValue(normalizedValue)
    }

    onChange?.(normalizedValue, event)
  }

  return (
    <EditorContainer $width={props.width}>
      <CodeMirror
        data-testid={'code-mirror-editor'}
        basicSetup={{
          foldGutter: false,
          highlightActiveLineGutter: false,
          lineNumbers: true,
        }}
        extensions={[
          hideFocusOutline,
          editorPanelsTheme,
          topPanel ? showPanel.of(topPanel) : [],
          showPanel.of(statusPanel),
          indentUnit.of('  '),
          getLanguageExtension(editorLanguage),
          ...extensions,
        ]}
        theme={resolvedTheme}
        value={editorValue}
        {...props}
        className={cn('min-w-0', className)}
        onChange={handleChange}
        onUpdate={onUpdate}
        style={{
          ...padding,
          ...props.style,
        }}
      />
    </EditorContainer>
  )
}

export default CodeMirrorEditor
