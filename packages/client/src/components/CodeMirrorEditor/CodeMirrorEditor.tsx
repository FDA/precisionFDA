import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { yaml } from '@codemirror/lang-yaml'
import { StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import CodeMirror, { EditorView, type ReactCodeMirrorProps, type ViewUpdate } from '@uiw/react-codemirror'
import { useState } from 'react'
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
}

const hideFocusOutline = EditorView.theme({
  '&.cm-focused': {
    outline: 'none !important',
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

const CodeMirrorEditor = ({
  className,
  defaultLanguage,
  defaultValue = '',
  extensions = [],
  formatDocument,
  language,
  onChange,
  options,
  value,
  ...props
}: CodeMirrorEditorProps) => {
  const { resolvedTheme } = useTheme()
  const editorLanguage = language ?? defaultLanguage
  const isControlled = value !== undefined
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    formatValue(defaultValue, editorLanguage, formatDocument),
  )
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
    <CodeMirror
      data-testid={'code-mirror-editor'}
      basicSetup={{
        foldGutter: false,
        highlightActiveLineGutter: false,
      }}
      extensions={[hideFocusOutline, getLanguageExtension(editorLanguage), ...extensions]}
      theme={resolvedTheme}
      value={editorValue}
      {...props}
      className={cn('min-w-0', className)}
      onChange={handleChange}
      style={{
        ...padding,
        ...props.style,
      }}
    />
  )
}

export default CodeMirrorEditor
