---
class: CommandLineTool
id: app-1
label: default_title
cwlVersion: v1.0
baseCommand:
- "/opt/wtsi-cgp/bin/sums2json.sh"
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
    inputBinding:
      position: 1
      prefix: "--anything"
    type: string
    doc: anything
    label: anything
outputs:
  my_file:
    type: File
    doc: my_file
    label: my_file
    outputBinding:
      glob: my_file/*
  my_string:
    type: string
    doc: my_string
    label: my_string
    outputBinding:
      glob: my_string
      loadContents: true
      outputEval: $(file_string())
