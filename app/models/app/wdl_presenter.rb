class App
  class WdlPresenter
    include ActiveModel::Validations

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
          optional: false,
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
          optional: false,
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

    def code
      wdl_filename = "#{workflow_name}.wdl"
      inputs_filename = "inputs.json"
      cromwell_jar = "cromwell.jar"
      cromwell_conf = "cromwell.conf"

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
#{File.read(File.expand_path("../#{cromwell_conf}", __FILE__))}
EOF

java -Dconfig.file=#{cromwell_conf} -jar #{cromwell_jar} run #{wdl_filename} -i #{inputs_filename}
CODE
    end

    def udocker_install_code
      <<-CODE
wget -q -O udocker.tgz #{UDOCKER_LINK}
tar xzvf udocker.tgz udocker
chmod u+rx ./udocker
UDOCKER_TARBALL=$(pwd)/udocker.tgz ./udocker --allow-root install || true
mv udocker /usr/local/bin
CODE
    end

    def task
      @task ||= tasks.first
    end

    def wdl_object
      @wdl_object ||= WdlObject.new(raw)
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
