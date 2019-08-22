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

    it "code includes correct inputs settings in json" do
      inputs = JSON.parse(result[:code][/inputs.json\s*?\n(.+?)(?=EOF)/m, 1])
      expected = {
        "single_task.app_a.in_boolean" => "${in_boolean}",
        "single_task.app_a.in_string" => "${in_string}",
        "single_task.app_a.in_file" => "${in_file_path}",
      }

      expect(inputs.size).to eq(3)
      expect(inputs).to include(expected)
    end

    it "code includes udocker run call in cromwell config" do
      expected = "udocker --allow-root run -v ${cwd}:${docker_cwd} " \
                 "${docker} ${job_shell} ${docker_script}"

      expect(result[:code]).to include(expected)
    end

    it "code includes python script that links outputs" do
      py_code = result[:code][/python\s*<<EOF(.+?)(?=EOF)/m, 1]

      expect(py_code).to include('re.sub("single_task.app_a.', 'with open("job_outputs.json") as')
    end

    context "when asset is present" do
      it "code includes udocker import" do
        asset_filename = "app_a.tar.gz"

        asset = instance_double("Asset", file_paths: ["/work/#{asset_filename}"])
        presenter.asset = asset

        expect(result[:code]).to include \
          "udocker --allow-root import #{asset_filename} #{presenter.docker}"
      end
    end

    context "when asset doesn't present" do
      it "code doesn't include udocker import" do
        expect(result[:code]).not_to include("udocker import")
      end
    end
  end
end
