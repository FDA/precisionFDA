class App
  class CwlParser
    CWL_FILE_NAME = "description.cwl".freeze
    CWLTOOL_INPUTS_FILE = "input_settings.json".freeze
    CWLTOOL_OUTPUTS_FILE = "cwl_job_outputs.json".freeze

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
#{setup_python3}
#{docker_load(image_filename)}
cat <<"EOF" > #{CWL_FILE_NAME}
#{cwl}
EOF

#{replace_docker_pull if image_filename}
cat <<EOF > #{CWLTOOL_INPUTS_FILE}
#{normalize_inputs_json(cwl, input_settings(cwl).to_json)}
EOF

cwltool #{CWL_FILE_NAME} #{CWLTOOL_INPUTS_FILE} > #{CWLTOOL_OUTPUTS_FILE}

# deactivate python3 environment
deactivate

#{link_outputs}
CODE
      end

      def replace_docker_pull
        %{sed -i "s|dockerPull:.*|dockerImageId: \"$dockerImageId\"|g" #{CWL_FILE_NAME}\n}
      end

      def setup_python3
        <<-CODE
# Unset python2 ENV variable to avoid problems with python3
unset PYTHONPATH

# Create python3 environment
python3 -m venv venv
source venv/bin/activate

# Upgrade Pip to the latest and install CWLtool
pip install -U pip
pip install cwltool
CODE
      end

      def docker_load(image_filename)
        return if image_filename.blank?

        "# Load the uploaded Docker image to the local registry\n" \
        "dockerImageId=`docker load < #{image_filename} | sed -n -e 's/^Loaded image: //p'`\n"
      end

      def link_outputs
        <<-CODE
# Link CWL job outputs with pFDA outputs (using python2)
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

with open("#{CWLTOOL_OUTPUTS_FILE}") as f:
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
