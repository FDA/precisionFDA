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
          packages: %w(libxml2-dev libxslt1-dev zlib1g-dev),
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

        script = <<-CODE
pip install --upgrade setuptools==12.4
PYTHONUSERBASE=$DNANEXUS_HOME pip install --upgrade --user requests==2.21.0 networkx==2.2
pip install cwltool

cat <<"EOF" > description.cwl
#{cwl}
EOF

cat <<EOF > input_settings.json
#{normalize_inputs_json(cwl, input_settings(cwl).to_json)}
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

        if asset
          image_filename = File.basename(asset.file_paths.first)

          script.prepend(
            <<-CODE
gunzip #{image_filename}
docker2aci #{image_filename.sub('.gz', '')}
mkdir -p #{DX_DOCKER_CACHE}
aci_file=`find . -name "*.aci"`
mv $aci_file #{DX_DOCKER_CACHE}/#{CGI.escape(cwl.docker)}.aci

CODE
          )
        end

        script
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
