require "rails_helper"

RSpec.describe WdlExporter::Task do
  let(:input) do
    [
      {
        name: "in_string",
        class: "string",
        optional: false,
        label: "anything",
        help: "anything",
      },
      {
        name: "in_boolean",
        class: "boolean",
        optional: false,
        label: "anything",
        help: "anything",
      },
      {
        name: "in_file",
        class: "file",
        optional: false,
        label: "anything",
        help: "anything",
      },
    ]
  end

  let(:output) do
    [
      {
        "name": "out_file",
        "class": "file",
        "optional": false,
        "label": "out_file",
        "help": "out_file",
      },
      {
        "name": "out_string",
        "class": "string",
        "optional": false,
        "label": "out_string",
        "help": "out_string",
      },
    ]
  end

  let(:app) do
    build(
      :app,
      input_spec: input,
      output_spec: output,
      app_series: build(:app_series, name: "app_a")
    )
  end
  let(:step) { described_class.new(app) }

  describe "#to_s" do
    it "generates a correct string" do
      expect(step.to_s).to eq File.read("spec/support/files/task.wdl")
    end
  end
end
