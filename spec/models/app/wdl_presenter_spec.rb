require "rails_helper"

RSpec.describe App::WdlPresenter do
  describe "#build" do
    let(:wdl_text) { IO.read(Rails.root.join("spec/support/files/task.wdl")) }

    subject { described_class.new(wdl_text) }

    it "returns correct app name" do
      expect(subject.build[:name]).to eq("app_a")
    end

    it "returns correct inputs" do
      expect(subject.build[:input_spec].size).to eq(3)

      expect(subject.build[:input_spec]).to contain_exactly(
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
      expect(subject.build[:output_spec].size).to eq(2)

      expect(subject.build[:output_spec]).to contain_exactly(
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
  end
end
