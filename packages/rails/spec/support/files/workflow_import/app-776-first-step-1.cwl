---
class: CommandLineTool
id: app-FXKBg3803PFFYJjz11BgJ4b4
label: app-776-first-step-1
cwlVersion: v1.0
baseCommand: []
requirements:
- class: DockerRequirement
  dockerPull: app-776-first-step-1
  dockerOutputDirectory: "/data/out"
- class: InlineJavascriptRequirement
  expressionLib:
  - function file_string() { return self[0].contents.replace(/(\r\n|\n|\r)/gm,"")
    }
inputs:
  input_file_param_1:
    inputBinding:
      position: 1
      prefix: "--input_file_param_1"
    type: File
  input_string_param_1:
    inputBinding:
      position: 2
      prefix: "--input_string_param_1"
    type: string
outputs:
  output_file_param_1:
    type: File
    outputBinding:
      glob: output_file_param_1/*
  output_string_param_1:
    type: string
    outputBinding:
      glob: output_string_param_1
      loadContents: true
      outputEval: $(file_string())
