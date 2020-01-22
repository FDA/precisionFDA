class App
  class WdlPresenter
    include ActiveModel::Validations

    # TODO: it's better to upload these two as assets and do not download them every time!
    CROMWELL_LINK =
      "https://github.com/broadinstitute/cromwell/releases/download/44/cromwell-44.jar".freeze
    UDOCKER_LINK = "https://download.ncg.ingrid.pt/webdav/udocker/udocker-1.1.2.tar.gz".freeze

    validate :wdl_object_should_be_valid
    validates :tasks, length: { is: 1, message: "number is wrong" }

    attr_reader :raw
    attr_accessor :asset

    def initialize(wdl_text)
      @raw = wdl_text
    end

    def build
      {
        name: app_name,
        title: app_name,
        readme: "",
        input_spec: input_spec,
        output_spec: output_spec,
        internet_access: true,
        instance_type: "baseline-8",
        code: code,
        packages: %w(openjdk-8-jre-headless),
        ordered_assets: Array(asset.try(:uid)),
      }
    end

    private

    def input_spec
      inputs.map do |input|
        {
          name: input.name,
          class: input.pfda_type,
          optional: input.optional?,
          label: "",
          help: "",
        }
      end
    end

    def output_spec
      outputs.map do |output|
        {
          name: output.name,
          class: output.pfda_type,
          optional: output.optional?,
          label: "",
          help: "",
        }
      end
    end

    def input_settings
      inputs.each_with_object({}) do |input, memo|
        input_name = "#{workflow_name}.#{app_name}.#{input.name}"
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

    # How to prepare docker container tarball for WDL-importing to pFDL.
    # Example:
    #
    # docker create --name cgp-chksum quay.io/wtsicgp/dockstore-cgp-chksum:0.4.1
    # docker export cgp-chksum | gzip -9 > cgp-chksum.tar.gz
    #
    def code
      # rubocop:disable Layout/IndentHeredoc
      wdl_filename = "#{workflow_name}.wdl"
      inputs_filename = "inputs.json"
      cromwell_jar = "cromwell.jar"
      cromwell_conf = "cromwell.conf"
      job_outputs = "job_outputs.json"
      image_filename = File.basename(asset.file_paths.first) if asset

      <<-CODE
#{udocker_install_code}
wget -q -O #{cromwell_jar} #{CROMWELL_LINK}

cat <<"EOF" > #{wdl_filename}
#{raw}
EOF

cat <<EOF > #{inputs_filename}
#{JSON.pretty_generate(input_settings)}
EOF

cat <<"EOF" > #{cromwell_conf}
#{File.read(Rails.root.join('config', cromwell_conf))}
EOF
#{"\nudocker --allow-root import #{image_filename} #{docker}\n" if image_filename}
java -Dconfig.file=#{cromwell_conf} -jar #{cromwell_jar} run #{wdl_filename} \
-i #{inputs_filename} \
-m #{job_outputs}

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

with open("#{job_outputs}") as f:
  cwloutputs = json.loads(f.read())['outputs']

for oname, ovalue in cwloutputs.items():
  if ovalue is not None:
    sh("emit {} {}".format(re.sub("#{workflow_name}.#{app_name}.", "", oname), ovalue))
EOF
      CODE
    end

    def udocker_install_code
      <<-CODE
wget --no-check-certificate -q -O udocker.tgz #{UDOCKER_LINK}
tar xzvf udocker.tgz udocker
chmod u+rx ./udocker
UDOCKER_TARBALL=$(pwd)/udocker.tgz ./udocker --allow-root install || true
mv udocker /usr/local/bin
      CODE
      # rubocop:enable Layout/IndentHeredoc
    end

    def task
      @task ||= tasks.first
    end

    def wdl_object
      @wdl_object ||= WDLObject.new(raw)
    end

    def wdl_object_should_be_valid
      if wdl_object.invalid?
        wdl_object.errors.full_messages.each do |msg|
          errors.add("base", msg)
        end
      end
    end

    delegate :inputs, :outputs, :docker, :docker_image, to: :task
    delegate :tasks, :workflow, to: :wdl_object
    delegate :name, to: :task, prefix: "app"
    delegate :name, to: :workflow, prefix: true, allow_nil: true
  end
end
