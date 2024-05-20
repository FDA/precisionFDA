pip install --upgrade setuptools==12.4
PYTHONUSERBASE=$DNANEXUS_HOME pip install --upgrade --user requests==2.21.0
pip install cwltool

cat <<EOF > description.cwl
class: CommandLineTool
id: app-1
label: default_title
cwlVersion: v1.0
baseCommand: ["/opt/wtsi-cgp/bin/sums2json.sh"]
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
EOF

cat <<EOF > input_settings.json
{"anything":"${anything}"}
EOF

cwltool --user-space-docker-cmd=dx-docker description.cwl input_settings.json > cwl_job_outputs.json

python <<EOF
import os
import json
import subprocess

def sh(cmd, ignore_error=False):
  try:
    print cmd
    subprocess.check_call(cmd, shell=True)
  except subprocess.CalledProcessError as e:
    sys.exit(e.returncode)

with open("cwl_job_outputs.json") as f:
  cwloutputs = json.loads(f.read())

def is_output_file(ovalue):
  return 'class' in ovalue and ovalue['class'] == 'File'

def compile_output_generic(oname, ovalue):
  if isinstance(ovalue, list):
    return [ compile_output_generic(oname, x) for x in ovalue ]
  elif isinstance(ovalue, dict):
    if is_output_file(ovalue):
      sh("emit {} {}".format(oname, ovalue['path']))
  else:
    if ovalue is not None:
      sh("emit {} {}".format(oname, ovalue))

for oname, ovalue in cwloutputs.items():
  compile_output_generic(oname, ovalue)
EOF
