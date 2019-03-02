class App::CwlParser
  class << self
    def parse(cwl)
      {
        name: cwl.id,
        title: cwl.label,
        readme: cwl.doc,
        input_spec: input_spec(cwl),
        output_spec: output_spec(cwl),
        internet_access: true,
        code: code(cwl),
        packages: %w(libxml2-dev libxslt1-dev zlib1g-dev)
      }
    end

    private

    def input_spec(cwl)
      cwl.inputs.map do |input|
        {
          name: input.name,
          class: input.pfda_type,
          optional: input.optional,
          label: input.label,
          help: input.doc,
          default: input.default,
        }
      end
    end

    def output_spec(cwl)
      cwl.outputs.map do |output|
        {
          name: output.name,
          class: output.pfda_type,
          optional: output.optional,
          label: output.label,
          help: output.doc,
        }
      end
    end

    def code(cwl)
      <<-CODE
pip install --upgrade setuptools==12.4
PYTHONUSERBASE=$DNANEXUS_HOME pip install --upgrade --user requests==2.21.0
pip install cwltool

cat <<EOF > description.cwl
#{cwl}
EOF

cat <<EOF > input_settings.json
#{input_settings(cwl).to_json}
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
CODE
    end

    def settings_for(input)
      if input.type == 'File'
        {
          class: 'File',
          path: "${#{input.name}_path}"
        }
      else
        "${#{input.name}}"
      end
    end

    def input_settings(cwl)
      cwl.inputs.each_with_object({}) do |input, memo|
        memo[input.name] = settings_for(input)
      end
    end
  end
end
