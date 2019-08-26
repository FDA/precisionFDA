class App
  class WdlPresenter
    include ActiveModel::Validations

    CROMWELL_LINK =
      "https://github.com/broadinstitute/cromwell/releases/download/38/cromwell-38.jar".freeze

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
      wdl_filename = "#{workflow_name || 'description'}.wdl"

      <<-CODE
wget -q -O cromwell.jar #{CROMWELL_LINK}

cat <<"EOF" > #{wdl_filename}
#{raw}
EOF

cat <<EOF > inputs.json
#{JSON.pretty_generate(input_settings)}
EOF

java -jar cromwell.jar run #{wdl_filename} -i inputs.json
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
