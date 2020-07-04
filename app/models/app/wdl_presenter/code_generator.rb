class App
  class WdlPresenter
    # Generates the code for WDL-related app script.
    class CodeGenerator
      # TODO: it's better to upload this as asset and don't download it every time!
      CROMWELL_LINK = "https://github.com/broadinstitute/cromwell/" \
                      "releases/download/44/cromwell-44.jar".freeze
      CROMWELL_JAR = "cromwell.jar".freeze
      CROMWELL_INPUTS_FILE = "inputs.json".freeze
      CROMWELL_OUTPUTS_FILE = "job_outputs.json".freeze
      IMAGE_ID_VAR = "dockerImageId".freeze

      class << self
        # Generates the code for CWL-related app script.
        #
        # How to prepare docker container tarball for WDL-importing to pFDA.
        # Example:
        #
        # docker create --name cgp-chksum quay.io/wtsicgp/dockstore-cgp-chksum:0.4.1
        # docker export cgp-chksum | gzip -9 > cgp-chksum.tar.gz
        #
        # @param wdl_object [WDLObject] Wrapper for a WDL.
        # @param image_filename [String] Docker image filename (*.tar.gz).
        # @return [String] App script code.
        #
        def generate(wdl_object, image_filename)
          task = wdl_object.tasks.first
          workflow = wdl_object.workflow

          task_full_name = "#{workflow.name}.#{task.name}"
          wdl_filename = "#{workflow.name}.wdl"

          <<~CODE
            wget -q -O #{CROMWELL_JAR} #{CROMWELL_LINK}
            #{docker_load(image_filename) if image_filename}
            cat <<"EOF" > #{wdl_filename}
            #{wdl_object.raw}
            EOF
            #{replace_docker_pull(wdl_filename) if image_filename}
            cat <<EOF > #{CROMWELL_INPUTS_FILE}
            #{JSON.pretty_generate(input_settings(task.inputs, task_full_name))}
            EOF

            java -jar #{CROMWELL_JAR} run #{wdl_filename} \
            -i #{CROMWELL_INPUTS_FILE} \
            -m #{CROMWELL_OUTPUTS_FILE}

            #{link_outputs(task_full_name)}
          CODE
        end

        private

        # Replaces dockerPull by dockerImageId in a CWL-file.
        # @param wdl_filename [String] WDL script filename.
        # @return [String] dockerImageId directive.
        def replace_docker_pull(wdl_filename)
          %(\nsed -i "s|docker:.*|docker: \\"$#{IMAGE_ID_VAR}\\"|g" #{wdl_filename}\n)
        end

        # Returns the code for outputs linking.
        # @param task_full_name [String] WDL task full name.
        # @return [String] The code.
        def link_outputs(task_full_name)
          <<~CODE
            python <<EOF
            import json
            import subprocess
            import re

            def sh(cmd, ignore_error=False):
              try:
                print cmd
                subprocess.check_call(cmd, shell=True)
              except subprocess.CalledProcessError as e:
                sys.exit(e.returncode)

            with open("#{CROMWELL_OUTPUTS_FILE}") as f:
              cwloutputs = json.loads(f.read())['outputs']

            for oname, ovalue in cwloutputs.items():
              if ovalue is not None:
                sh("emit {} {}".format(re.sub("#{task_full_name}.", "", oname), ovalue))
            EOF
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

        def input_settings(inputs, task_full_name)
          inputs.each_with_object({}) do |input, memo|
            input_name = "#{task_full_name}.#{input.name}"
            memo[input_name] = settings_for(input)
          end
        end

        def settings_for(input)
          if input.object_type == "File"
            "${#{input.name}_path}"
          else
            "${#{input.name}}"
          end
        end
      end
    end
  end
end
