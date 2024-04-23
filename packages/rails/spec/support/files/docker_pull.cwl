#!/usr/bin/env cwl-runner

class: CommandLineTool

id: "cgp-chksum"

label: "CGP file checksum generator"

cwlVersion: v1.0

doc: |
    A Docker container for producing file md5sum and sha512sum.

requirements:
  - class: DockerRequirement
    dockerPull: "quay.io/wtsicgp/dockstore-cgp-chksum:0.1.0"

inputs:
  in_file:
    type: File
    doc: "file to have checksum generated from"
    inputBinding:
      position: 1

  post_address:
    type: ["null", string]
    doc: "Optional POST address to send JSON results"
    inputBinding:
      position: 2
      prefix: --address

  optional_string:
    type: string?
    doc: "Some optional string"
    inputBinding:
      position: 3
      prefix: --tt

  bool_flag:
    type: boolean?
    doc: "Some boolean flag"
    inputBinding:
      position: 4
      prefix: --bf

  int_input:
    type: int?
    doc: "Some int input"
    inputBinding:
      position: 5
      prefix: --int-input

  float_input:
    type: float?
    doc: "Some boolean flag"
    inputBinding:
      position: 6
      prefix: --float-input

  double_input:
    type: double?
    doc: "Some double input"
    inputBinding:
      position: 7
      prefix: --double-input

outputs:
  chksum_json:
    type: File
    outputBinding:
      glob: check_sums.json

  post_server_response:
    type: ["null", File]
    outputBinding:
      glob: post_server_response.txt

baseCommand: ["/opt/wtsi-cgp/bin/sums2json.sh"]
