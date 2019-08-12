require "rails_helper"

RSpec.describe App::WdlPresenter do
  describe "#build" do
    let(:wdl_text) { IO.read(Rails.root.join("spec/support/files/task.wdl")) }

    subject { described_class.new(wdl_text) }

    let(:result) { subject.build }

    it "returns correct app name" do
      expect(result[:name]).to eq("app_a")
    end

    it "returns correct inputs" do
      expect(result[:input_spec].size).to eq(3)

      expect(result[:input_spec]).to contain_exactly(
        {
          name: "in_string",
          class: "string",
          optional: false,
          label: "",
          help: "",
        },
        {
          name: "in_boolean",
          class: "boolean",
          optional: false,
          label: "",
          help: "",
        },
        name: "in_file",
        class: "file",
        optional: false,
        label: "",
        help: "",
      )
    end

    it "returns correct outputs" do
      expect(result[:output_spec].size).to eq(2)

      expect(result[:output_spec]).to contain_exactly(
        {
          name: "out_file",
          class: "file",
          optional: false,
          label: "",
          help: "",
        },
        name: "out_string",
        class: "string",
        optional: false,
        label: "",
        help: "",
      )
    end

    context "code" do
      it "returns correct inputs settings in json" do
        inputs = JSON.parse(result[:code][/inputs.json\s*?\n(.+)EOF/m, 1])
        expected = {
          "single_task.app_a.in_boolean" => "${in_boolean}",
          "single_task.app_a.in_string" => "${in_string}",
          "single_task.app_a.in_file" => "${in_file_path}",
        }

        expect(inputs.size).to eq(3)
        expect(inputs).to include(expected)
      end
    end
  end
end
