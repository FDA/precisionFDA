cwlVersion: v1.0
class: Workflow
id: workflow-776-4
label: workflow-776-4
inputs:
 input_file_param_1: File
 input_string_param_1: string
steps:
 app-776-first-step-1:
   id: app-FXKBg3803PFFYJjz11BgJ4b4-1
   run: app-776-first-step-1.cwl
   in:
     input_file_param_1: input_file_param_1
     input_string_param_1: input_string_param_1
   out:
     output_file_param_1
     output_string_param_1
 app-776-second-step-1:
   id: app-FXKBjg807jkfZKYq126yx61f-1
   run: app-776-second-step-1.cwl
   in:
     input_file_param_1: app-776-first-step-1/output_file_param_1
     input_string_param_1: app-776-first-step-1/output_string_param_1
   out:
   - output_file_param_1
   - output_string_param_1
outputs:
 output_file_param_1:
   type: File
   outputSource: app-776-second-step-1/output_file_param_1
 output_string_param_1:
   type: string
   outputSource: app-776-second-step-1/output_string_param_1