#!/usr/bin/env cwl-runner

class: CommandLineTool

id: "cgp-chksum"

label: "CGP file checksum generator"

cwlVersion: v1.0

doc: |
    ![build_status](https://quay.io/repository/wtsicgp/dockstore-cgp-chksum/status)
    A Docker container for producing file md5sum and sha512sum. See the [dockstore-cgp-chksum](https://github.com/cancerit/dockstore-cgp-chksum) website for more information.

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

  test_type_simplification:
    type: string?
    doc: "Optional POST address to send JSON results"
    inputBinding:
      position: 2
      prefix: --address

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
