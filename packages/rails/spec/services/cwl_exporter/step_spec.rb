require 'rails_helper'

RSpec.describe CwlExporter::Step do
  let(:input) do
    [
      {
        name: "anything",
        class: "string",
        optional: false,
        label: "anything",
        help: "anything"
      }
    ]
  end

  let(:output) do
    [
      {
        "name": "my_file",
        "class": "file",
        "optional": false,
        "label": "my_file",
        "help": "my_file"
      },
      {
        "name": "my_string",
        "class": "string",
        "optional": false,
        "label": "my_string",
        "help": "my_string"
      }
    ]
  end

  let(:expected_output) do
    File.read("spec/support/files/step.cwl")
  end

  let(:app) do
    build(
      :app,
      dxid: "app-1",
      input_spec: input,
      output_spec: output,
      code: File.read("spec/support/files/app_script.sh"),
      app_series: build(:app_series, name: "app_a")
    )
  end

  let(:step) { described_class.new(app) }

  describe "#to_s" do
    it "generates a correct string" do
      expect(step.to_s).to eq expected_output
    end
  end
end
