---
class: CommandLineTool
id: app-1
label: default_title
cwlVersion: v1.0
baseCommand: []
requirements:
- class: DockerRequirement
  dockerPull: app_a
  dockerOutputDirectory: "/data/out"
- class: InlineJavascriptRequirement
  expressionLib:
  - function file_string() { return self[0].contents.replace(/(\r\n|\n|\r)/gm,"")
    }
inputs:
  anything:
    doc: anything
    inputBinding:
      position: 1
      prefix: "--anything"
    type: string
outputs:
  my_file:
    doc: my_file
    type: File
    outputBinding:
      glob: my_file/*
  my_string:
    doc: my_string
    type: string
    outputBinding:
      glob: my_string
      loadContents: true
      outputEval: $(file_string())
