---
cwlVersion: v1.0
class: Workflow
inputs:
  any_a: string
  any_b: string
steps:
  app_a:
    run: app_a.cwl
    in:
      any_a: any_a
    out:
    - out_a
  app_b:
    run: app_b.cwl
    in:
      any_b: any_b
      file_b: app_a/out_a
    out:
    - out_b
outputs:
  out_b:
    type: File
    outputSource: app_b/out_b
