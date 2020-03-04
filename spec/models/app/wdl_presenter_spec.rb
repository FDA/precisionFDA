require "rails_helper"

RSpec.describe App::WdlPresenter do
  describe "#build" do
    let(:wdl_text) { IO.read(Rails.root.join("spec/support/files/task.wdl")) }

    subject(:presenter) { described_class.new(wdl_text) }

    let(:result) { presenter.build }

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
  end
end
