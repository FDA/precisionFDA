class App
  class CwlParser
    # Generates the code for CWL-related app script.
    class CodeGenerator
      CWL_FILE_NAME = "description.cwl".freeze
      CWLTOOL_INPUTS_FILE = "input_settings.json".freeze
      CWLTOOL_OUTPUTS_FILE = "cwl_job_outputs.json".freeze
      IMAGE_ID_VAR = "dockerImageId".freeze

      class << self
        # Generates the code for CWL-related app script.
        # @param cwl [CwlPresenter] CWL object.
        # @return [String] App script code.
        def generate(cwl)
          asset = cwl.asset
          image_filename = asset && File.basename(asset.file_paths.first)

          <<~CODE
            #{setup_python3.strip}
            #{docker_load(image_filename) if image_filename}
            cat <<"EOF" > #{CWL_FILE_NAME}
            #{cwl}
            EOF
            #{replace_docker_pull if image_filename}
            cat <<EOF > #{CWLTOOL_INPUTS_FILE}
            #{normalize_inputs_json(cwl, input_settings(cwl).to_json)}
            EOF

            cwltool #{CWL_FILE_NAME} #{CWLTOOL_INPUTS_FILE} > #{CWLTOOL_OUTPUTS_FILE}

            # Deactivate python3 environment
            deactivate

            #{link_outputs}
          CODE
        end

        private

        # Replaces dockerPull by dockerImageId in a CWL-file.
        # @return [String] dockerImageId directive.
        def replace_docker_pull
          %(\nsed -i "s|dockerPull:.*|dockerImageId: \"$#{IMAGE_ID_VAR}\"|g" #{CWL_FILE_NAME}\n)
        end

        # Code for python3 setup and packages install/upgrade.
        # @return [String] The code.
        def setup_python3
          <<~CODE
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

        # Returns the code for loading uploaded Docker image to the local registry.
        # @param image_filename [String] Uploaded Docker image filename (.tar.gz).
        # @return [String] The code.
        def docker_load(image_filename)
          return unless image_filename

          "\n# Load the uploaded Docker image to the local registry\n" \
          "#{IMAGE_ID_VAR}=`docker load < #{image_filename} | sed -n -e 's/^Loaded image: //p'`\n"
        end

        # Returns the code for outputs linking. This code depends on dxpy package and needs to be
        #   run with python2.
        # @return [String] The code.
        def link_outputs
          <<~CODE
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

        # Returns input settings for cwltool.
        # @param cwl [CwlPresenter] CWL object.
        # @return [Hash] Input settings.
        def input_settings(cwl)
          cwl.inputs.each_with_object({}) do |input, memo|
            memo[input.name] = settings_for(input)
          end
        end

        # Returns settings for input according to its type.
        # @param input [CwlPresenter::IOObject] CWL input object.
        # @return [String, Hash] Input settings.
        def settings_for(input)
          if input.type == "File"
            {
              class: "File",
              path: "${#{input.name}_path}",
            }
          else
            "${#{input.name}}"
          end
        end

        # Removes double/single quotes from input values that are supposed to be of
        #   int/double/float/boolean type.
        # @param cwl [CwlPresenter] CWL object.
        # @param json [String] Input settings in JSON format.
        # @return [String] Normalized json string.
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
end
