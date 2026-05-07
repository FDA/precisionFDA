import Editor, { type EditorProps, loader, type Monaco } from '@monaco-editor/react'
import type * as monacoEditor from 'monaco-editor'
import { ENABLE_DEV_MSW } from '@/utils/env'
import { useTheme } from '@/utils/ThemeContext'

if (!ENABLE_DEV_MSW) {
  loader.config({
    paths: {
      // Use absolute path to avoid monaco-editor bug when loading from relative path (https://github.com/microsoft/monaco-editor/issues/4778)
      // vs: `${import.meta.env.BASE_URL}monaco-editor/min/vs`,
      // TODO(PFDA-6918): Bump monaco-editor when they fix the dompurify dependency to resolve the CVE-2026-0540 vulnerability (https://nvd.nist.gov/vuln/detail/CVE-2026-0540)
      vs: `${window.location.origin}${import.meta.env.BASE_URL}monaco-editor/min/vs`,
    },
  })
}

const MonacoEditor = (props: Partial<EditorProps & { formatDocument: boolean }>) => {
  const { resolvedTheme } = useTheme()
  const editorDidMountHook = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const model = editor.getModel()
    if (!model) return
    model.setEOL(monaco.editor.EndOfLineSequence.LF)
    if (props?.formatDocument) {
      setTimeout(() => {
        editor.getAction('editor.action.formatDocument')?.run()
      }, 300)
    }
  }

  const onCodeChange = (newCodes?: string, ev?: monacoEditor.editor.IModelContentChangedEvent) => {
    const newline = /\r\n|\r|\n/g
    // replace the eol to \n
    const changeEOL = newCodes?.replace(newline, '\n')
    if (ev) {
      props.onChange?.(changeEOL, ev)
    }
  }

  return (
    <Editor
      options={{
        minimap: {
          enabled: false,
        },
        theme: resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light',
      }}
      {...props}
      onMount={editorDidMountHook}
      onChange={onCodeChange}
    />
  )
}

export default MonacoEditor
