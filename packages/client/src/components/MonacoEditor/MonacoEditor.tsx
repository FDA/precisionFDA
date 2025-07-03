import Editor, { loader, EditorProps, Monaco } from '@monaco-editor/react'
import * as monacoEditor from 'monaco-editor'
import React from 'react'
import { useTheme } from '../../utils/ThemeContext'

if(!process.env.ENABLE_DEV_MSW) {
  loader.config({
    paths: {
      vs: '/assets/monaco-editor/min/vs',
    },
  })
}

const MonacoEditor = (props: Partial<EditorProps & { formatDocument: boolean}>) => {
  const { theme } = useTheme()
  const editorDidMountHook = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const model = editor.getModel()
    if(!model) return
    model.setEOL(monaco.editor.EndOfLineSequence.LF)
    if(props?.formatDocument) {
      setTimeout(() => {
        editor.getAction('editor.action.formatDocument')?.run()
      }, 300)
    }
  }

  const onCodeChange = (newCodes?: string) => {
    const newline = /\r\n|\r|\n/g
    // replace the eol to \n 
    const changeEOL = newCodes?.replace(newline, '\n')
    props.onChange(changeEOL)
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
