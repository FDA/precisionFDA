class App
  class CwlParser
    class << self
      def parse(cwl)
        asset = cwl.asset

        {
          name: cwl.id,
          title: cwl.label,
          readme: cwl.doc,
          input_spec: input_spec(cwl),
          output_spec: output_spec(cwl),
          internet_access: true,
          instance_type: "baseline-8",
          code: code(cwl),
          packages: %w(python3-pip python3-venv python3-dev),
          ordered_assets: Array(asset.try(:uid)),
        }
      end

      private

      def input_spec(cwl)
        cwl.inputs.map do |input|
          inputs = {
            name: input.name,
            class: input.pfda_type,
            optional: input.optional,
            label: input.label,
            help: input.doc,
          }

          inputs[:default] = input.default if input.default

          inputs
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
        asset = cwl.asset
        image_filename = asset && File.basename(asset.file_paths.first)

        <<-CODE
unset PYTHONPATH

python3 -m venv venv
source venv/bin/activate

pip install -U pip
pip install cwltool

cat <<"EOF" > description.cwl
#{cwl}
EOF

cat <<EOF > input_settings.json
#{normalize_inputs_json(cwl, input_settings(cwl).to_json)}
EOF

#{"docker load < #{image_filename}\n" if image_filename}
cwltool description.cwl input_settings.json > cwl_job_outputs.json

deactivate

PYTHONPATH=$DNANEXUS_HOME/lib/python2.7/site-packages python2 <<EOF
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
        if input.type == "File"
          {
            class: "File",
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

      # remove double/single quotes from input values that are supposed to be
      #   int/double/float/boolean type
      def normalize_inputs_json(cwl, json)
        normalized = json.dup
        cwl.inputs.each do |input|
          next if %w(File string).include?(input.type)
          normalized.sub!("\"${#{input.name}}\"", " ${#{input.name}}")
        end
        normalized
      end
    end
  end
end
