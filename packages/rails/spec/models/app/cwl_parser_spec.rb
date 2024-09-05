require "rails_helper"

RSpec.describe App::CwlParser do
  let(:cwl_file_content) { File.read("spec/support/files/docker_pull.cwl") }
  let(:asset) do
    instance_double(Asset, uid: "app-1-1", file_paths: ["/work/repo_image_0.1.0.tar.gz"])
  end
  let(:cwl) do
    presenter = CwlPresenter.new(cwl_file_content)
    presenter.asset = asset
    presenter
  end

  describe ".parse" do
    subject(:result) do
      cwl.asset = asset
      described_class.parse(cwl)
    end

    it "returns app parameters" do
      expect(result).to match(hash_including(expected_params))
    end

    def expected_params
      { name: "cgp-chksum",
        title: "CGP file checksum generator",
        readme: "A Docker container for producing file md5sum and sha512sum.",
        input_spec: [
          hash_including(name: "in_file", class: "file", optional: false, label: "",
            help: "file to have checksum generated from"),
          hash_including(name: "post_address", class: "string", optional: true, label: "",
            help: "Optional POST address to send JSON results"),
          hash_including(name: "optional_string", class: "string", optional: true, label: "",
            help: "Some optional string"),
          hash_including(name: "bool_flag", class: "boolean", optional: true, label: "",
            help: "Some boolean flag"),
          hash_including(name: "int_input", class: "int", optional: true, label: "",
            help: "Some int input"),
          hash_including(name: "float_input", class: "float", optional: true, label: "",
            help: "Some boolean flag"),
          hash_including(name: "double_input", class: "float", optional: true, label: "",
            help: "Some double input"),
        ],
        output_spec: [
          hash_including(name: "chksum_json", class: "file", optional: false, label: "", help: ""),
          hash_including(name: "post_server_response", class: "file",
            optional: true, label: "", help: ""),
        ],
        internet_access: true,
        instance_type: "baseline-8",
        packages: ["python3-pip", "python3-venv", "python3-dev"],
        code: anything,
        ordered_assets: [asset.uid] }
    end
  end
end
