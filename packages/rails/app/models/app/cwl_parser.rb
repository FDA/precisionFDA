class App
  # Prepares the parameters used for creating an app in the Platform.
  class CwlParser
    class << self
      # Prepares the parameters used for creating an app in the Platform.
      # @param cwl [CwlPresenter] CWL object.
      # @return [Hash] The parameters used for creating an app in the Platform.
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
          code: App::CwlParser::CodeGenerator.generate(cwl),
          packages: %w(python3-pip python3-venv python3-dev),
          ordered_assets: Array(asset.try(:uid)),
        }
      end

      private

      # Creates input specification for the app.
      # @param cwl [CwlPresenter] CWL object.
      # @return [Hash] App input specification.
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

      # Creates output specification for the app.
      # @param cwl [CwlPresenter] CWL object.
      # @return [Hash] App output specification.
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
    end
  end
end
