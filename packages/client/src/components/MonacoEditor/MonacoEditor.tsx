import Editor, { EditorProps, loader, Monaco } from '@monaco-editor/react'
import * as monacoEditor from 'monaco-editor'
import { ENABLE_DEV_MSW } from '@/utils/env'
import { useTheme } from '@/utils/ThemeContext'

if (!ENABLE_DEV_MSW) {
  loader.config({
    paths: {
      vs: '/packs/monaco-editor/min/vs',
    },
  })
}

const MonacoEditor = (props: Partial<EditorProps & { formatDocument: boolean }>) => {
  const { theme } = useTheme()
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
        theme: theme === 'dark' ? 'vs-dark' : 'vs-light',
      }}
      {...props}
      onMount={editorDidMountHook}
      onChange={onCodeChange}
    />
  )
}

export default MonacoEditor
