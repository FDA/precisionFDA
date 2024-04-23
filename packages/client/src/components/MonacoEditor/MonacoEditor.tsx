import Editor, { loader, EditorProps, Monaco } from '@monaco-editor/react'
import React from 'react'

if(!ENABLE_DEV_MSW) {
  loader.config({
    paths: {
      vs: '/assets/monaco-editor/min/vs',
    },
  })
}

const MonacoEditor = (props: Partial<EditorProps & { formatDocument: boolean}>) => {
  const editorDidMountHook = (editor: any, monaco: Monaco) => {
    const model = editor.getModel()
    model.setEOL(monaco.editor.EndOfLineSequence.LF)

    if(props?.formatDocument) {
      setTimeout(() => {
        editor.getAction('editor.action.formatDocument').run()
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
      }}
      {...props}
      onMount={editorDidMountHook}
      onChange={onCodeChange}
    />
  )
}

export default MonacoEditor
